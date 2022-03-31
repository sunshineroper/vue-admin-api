import { Logger, ConsoleTransport } from 'egg-logger'
import FileTransport from './curstomer/fileTransport'
import config from '@/config'
import { merge } from 'lodash'

let defaultOptions = {
    level: 'INFO',
    dir: 'logs',
    sizeLimit: 1024 * 1024 * 5,
    file: false
}

let options = merge(defaultOptions, config.getItem('setting.log'), {})
export const logger = new Logger({})


logger.set(
    'console',
    new ConsoleTransport({
        level: options.level
    })
)
if (options.file) {
    logger.set(
        'file',
        new FileTransport({
            level: 'debug',
            dir: options.dir,
            sizeLimit: options.sizeLimit
        })
    )
}


export const logging = (app) => {
    app.context.logger = logger
}
