import { get } from 'lodash'
import { routeMetaInfo } from '@/lib'
import { LogModel } from '@/model/log'

export const logger = template => {
  return async (ctx, next) => {
    await next()
    writeLog(template, ctx)
  }
}

export function writeLog(template, ctx, err) {
  try {
    let message = template
    let permission
    if (ctx.matched) {
      const info = findAuthAndMoudle(ctx)
      if (info) {
        permission = get(info, 'permission')
        if (!message) message = `${get(info, 'module')} ${permission} ${err}`
      }
      LogModel.createLog(
        {
          message,
          user_id: ctx.currentUser.id,
          username: ctx.currentUser.username,
          status_code: ctx.status || 0,
          method: ctx.request.method,
          path: ctx.request.path,
          permission
        },
        true
      )
    }
  } catch (error) {
    console.log(error)
  }
}

function findAuthAndMoudle(ctx) {
  const name = ctx._matchedRouteName || ctx.routerName
  const endpoint = `${ctx.method} ${name}`
  return routeMetaInfo.get(endpoint)
}
