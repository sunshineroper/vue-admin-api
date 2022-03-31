import busboy from 'busboy'
import { HttpException, codeMessage, FileLargeException } from '@/lib'
import { extname } from 'path'
export const multipart = app => {
  app.context.multipart = async function (options) {
    let filePromises = []
    await busbody(this.req, {
      onFile: async function (filedName, file, filename, encoding, mimeType) {
        const filePromise = new Promise((resolve, reject) => {
          let buffers = []
          file
            .on('error', err => {
              file.resume()
              reject(err)
            })
            .on('data', data => {
              buffers.push(data)
            })
            .on('end', () => {
              const buf = Buffer.concat(buffers)
              resolve({
                size: buf.length,
                encoding: encoding,
                filedName: filedName,
                filename: filename,
                mimeType: mimeType,
                data: buf
              })
            })
        })
        filePromises.push(filePromise)
      }
    })
    const files = []
    let totalSize = 0
    for (const filePromise of filePromises) {
      let file
      try {
        file = await filePromise
      } catch (error) {
        throw new HttpException({ code: 10210 })
      }
      const ext = extname(file.filename)
      // TODO 校验文件单个大小
      const { valid, configSize } = checkFileSize(file.size)
      if (!valid) {
        throw new FileLargeException({
          code: 10110,
          message: codeMessage.getMessage(10110).replace('{size}', configSize).replace('{name}', file.filename)
        })
      }
      totalSize += file.size
      files.push(file)
    }
    // 校验文件大小
    const { valid: totalValid, configTotalSize } = checkTotalSize(totalSize)
    if (!totalValid) {
      throw new FileLargeException({
        code: 10111,
        message: codeMessage.getMessage(10111).replace('{size}', configTotalSize)
      })
    }
    return files
  }
}

const busbody = (req, options = {}) => {
  options.headers = req.headers
  const onFile = options.onFile
  delete options.onFile
  const bb = busboy(options)
  return new Promise((resolve, reject) => {
    req.on('close', cleanup)
    bb.on('file', onFile)
    bb.on('field', (name, val, info) => {
      console.log(`Field [${name}]: value: %j`, val)
    })
    req.pipe(bb)
    bb.on('error', err => {
      console.log(err)
    })
    bb.on('finish', () => {
      resolve({})
    })
    bb.on('end', () => {
      console.log('end')
    })
    const onEnd = err => {
      if (err) {
        return reject(err)
      }
      cleanup()
    }
    const onField = () => {
      console.log('onField')
    }
    function cleanup() {
      bb.removeListener('field', onField)
      bb.removeListener('file', onFile)
      bb.removeListener('close', cleanup)
      bb.removeListener('end', cleanup)
      bb.removeListener('error', onEnd)
      bb.removeListener('partsLimit', onEnd)
      bb.removeListener('filesLimit', onEnd)
      bb.removeListener('fieldsLimit', onEnd)
      bb.removeListener('finish', onEnd)
    }
    // resolve()
  })
}

const checkTotalSize = (totalSize) => {
  const configTotalSize = 1024 * 1024 * 30
  return {
    valid: configTotalSize > totalSize,
    configTotalSize
  }
}
const checkFileSize = (size) => {
  const configSize = 1024 * 1024 * 10
  return {
    valid: configSize > size,
    configSize
  }
}
