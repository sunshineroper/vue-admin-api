
import dayjs from 'dayjs'
import { Transport, utils } from 'egg-logger'
import path from 'path'
import fs from 'fs'
const baseDir = path.join(__dirname, '../../')
class FileTransport extends Transport {
  constructor(options) {
    super(options)
    this._stream = null
    this.reload()
  }

  log(level, args, meta) {
    const filename = this.checkIsPresent()
    if (filename) {
      const overFlow = this.checkSizeOverflow(filename)
      if (overFlow) {
        this.renameFile(filename)
        this.reload()
      }
    } else {
      this.reload()
    }
    const buf = super.log(level, args, meta)
    if (buf.length) this._stream.write(buf)

  }

  getFileName() {
    // const dir = path.isAbsolute(this.options.dir) ? this.options.dir : path.join(baseDir, this.options.dir)
    const basedir = path.join(baseDir, this.options.dir)
    const dir = path.join(basedir, dayjs().format('YYYY-MM-DD'))
    const fileName = path.join(dir, `${dayjs().format('YYYY-MM-DD')}.log`)
    return fileName
  }
  mkdir(dirname) {
    if (fs.existsSync(dirname)) {
      return true
    } else {
      if (this.mkdir(path.dirname(dirname))) {
        fs.mkdirSync(dirname)
        return true
      }
    }
  }
  checkIsPresent() {
    const fileName = this.getFileName()
    const exist = fs.existsSync(fileName)
    if (exist) {
      return fileName
    } else {
      false
    }
  }

  checkSizeOverflow(filename) {
    const limit = this.options.sizeLimit
    const status = fs.statSync(filename)
    return status.size > limit
  }
  renameFile(filename) {
    const day = dayjs()
    const oldFilenameDir = path.dirname(filename)
    const oldFile = path.join(oldFilenameDir, `${day.format('YYYY-MM-DD')}-${day.format('hh:mm:ss')}.log`)
    fs.renameSync(filename, oldFile)
  }
  _write(buf) {
    this._stream.write(buf)
  }
  reload() {
    this._closeStream()
    this._stream = this._createStream()
  }
  _closeStream() {
    if (this.stream) {
      this._stream.end()
      this._stream.removeListener('error', this._stream.onError)
      this._stream = null
    }
  }
  _createStream() {
    const fileName = this.getFileName()
    const dir = path.dirname(fileName)
    if (!fs.existsSync(dir)) {
      this.mkdir(dir)
    }
    const onError = err => {
      console.error(
        '%s ERROR %s [logger] [%s] %s',
        dayjs('YYYY-MM-DD hh:mm:ss'),
        process.pid,
        fileName,
        err.stack
      )
    }
    const stream = fs.createWriteStream(fileName, { flags: 'a+' })
    stream.once('error', onError)
    stream._onError = onError
    return stream
  }
}


export default FileTransport
