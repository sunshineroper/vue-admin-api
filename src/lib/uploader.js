import fs from 'fs'
import dayjs from 'dayjs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { FileModel } from '@/model/file'
const baseDir = path.resolve(__dirname, '../')
function mkdirSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}
class Uploader {
  upload(files) { }
  storePath(filename) {
    const filename2 = this.generateName(filename)
    const formatDay = this.getFormatDay()
    const dir = this.getExactStoreDir(formatDay)
    const exists = fs.existsSync(dir)
    if (!exists) {
      mkdirSync(dir)
    }
    return {
      absolutePath: path.join(dir, filename2),
      relativePath: `${formatDay}/${filename2}`,
      realName: filename
    }
  }
  generateName(filename) {
    const ext = path.extname(filename)
    return `${uuidv4()}${ext}`
  }
  getFormatDay() {
    return dayjs().format('YYYY/MM/DD')
  }
  getExactStoreDir(formatDay) {
    let storDir = '/static/upload'
    this.storDir && (storDir = this.storDir)
    // const extract = path.isAbsolute(storDir) ? path.join(storDir, formatDay) : path.join(baseDir, storDir, formatDay)
    const extract = path.join(baseDir, storDir, formatDay)
    return extract
  }
  generateMD5(file) {
    const data = file.data
    const hash = crypto.createHash('md5')
    return hash.update(data).digest('hex')
  }
}

class LocalUploader extends Uploader {
  async upload(files) {
    const arr = []
    for (const file of files) {
      const md5 = this.generateMD5(file)
      let exist = await FileModel.findOne({
        where: {
          md5
        }
      })
      if (exist) {
        arr.push({
          id: exist.id,
          key: '', // filedName BUG,
          path: exist.path,
          url: `http://localhost:4000/upload/${exist.path}`,
          type: exist.type,
          name: exist.name,
          size: exist.size,
          extension: exist.extension
        })
      } else {
        const { absolutePath, relativePath, realName } = this.storePath(file.filename, file.mimeType)
        const target = fs.createWriteStream(absolutePath)
        await target.write(file.data)
        const ext = path.extname(realName)
        let f = await FileModel.create({
          path: relativePath,
          name: realName,
          extension: ext,
          size: file.size,
          type: 1,
          md5
        })
        arr.push({
          id: f.id,
          key: '', // filedName BUG,
          path: f.path,
          url: `http://localhost:4000/upload/${f.path}`,
          type: f.type,
          name: f.name,
          size: f.size,
          extension: f.extension
        })
      }
    }
    return arr
  }
}

export { LocalUploader }
