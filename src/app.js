import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from 'koa2-cors'
import { Loader, Logger, json, logging, onError, success } from 'koa-cms-lib'
// import { multipart } from './middleware'
const applyExtension = (app) => {
  json(app)
  success(app)
  logging(app)
  // multipart(app)
}

const applyKoaMiddleware = (app) => {
  app.use(Logger)
  app.use(bodyParser())
  app.use(cors())
  app.on('error', onError)
  // app.use(koaStatic(path.join(process.cwd(), config.getItem('setting.staticDir'))))
}

const loadRouter = (app) => {
  new Loader(app)
}

export const createApp = () => {
  const app = new Koa()
  applyExtension(app)
  applyKoaMiddleware(app)
  loadRouter(app)
  return app
}
// PermissionModel.initpermission()
