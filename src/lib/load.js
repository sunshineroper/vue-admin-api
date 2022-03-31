import Router from 'koa-router'
import config from '@/config'
import { readFile } from '@/util'
import path from 'path'
import { get } from 'lodash'
class Load {
  constructor(app) {
    this.app = app
    this.loadRouter(app)
  }

  loadRouter(app) {
    const mainRouter = new Router()
    const res = path.join(process.cwd(), config.getItem('setting.apiDir'))
    const files = readFile(res)
    for (const file of files) {
      const ext = file.substring(file.lastIndexOf('.'), file.length)
      const mod = require(file)
      const debug = config.getItem('setting.debug')
      if (ext === '.js') {
        if (mod instanceof Router) {
          mainRouter.use(mod.routes()).use(mod.allowedMethods())
          if (debug) {
            console.log(`loading a router instance from file: ${file}`)
            get(mod[key], 'stack', []).forEach(ly => {
              console.log(`loading a route: ${get(ly, 'path')}`);
            })
          }
        } else if (!mod['disableLoading']) {
          Reflect.ownKeys(mod).forEach(key => {
            if (mod[key] instanceof Router) {
              mainRouter.use(mod[key].routes()).use(mod[key].allowedMethods())
              if (debug) {
                console.log(`loading a router instance from file: ${file}`)
                get(mod[key], 'stack', []).forEach(ly => {
                  console.log(`loading a route: ${get(ly, 'path')}`);
                })
              }
            }

          })
        }
      }
    }
    app.use(mainRouter.routes()).use(mainRouter.allowedMethods())
  }
}

export { Load }
