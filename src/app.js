import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from 'koa2-cors'
import koaStatic from 'koa-static'
import { success, logging, error, json, Load } from './lib'
import { log, multipart } from './middleware'
import { PermissionModel } from './model/permission'
import config from '@/config'
import path from 'path'
const app = new Koa()
const applyExtension = (app) => {
  json(app)
  success(app)
  logging(app)
  multipart(app)
}

const applyKoaMiddleware = (app) => {
  app.use(log)
  app.use(bodyParser())
  app.use(cors())
  app.use(koaStatic(path.join(process.cwd(), config.getItem('setting.staticDir'))))
}

const loadRouter = (app) => {
  new Load(app)
}

app.on('error', error)
PermissionModel.initpermission()
applyExtension(app)
applyKoaMiddleware(app)
loadRouter(app)

app.listen(4000, () => {
  console.log('this app listen port 4000')
})
