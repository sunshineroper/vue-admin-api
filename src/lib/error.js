import { HttpException, codeMessage } from '@/lib/http-exception'
import { writeLog } from '@/middleware'
import { logger } from '@/lib'
// const error  = async (ctx, next) => {
//    try {
//      await next()
//    } catch (err) {
//     if (err instanceof HttpException) {
//         ctx.type = 'application/json'
//         ctx.status = err.status || 500
//         ctx.body = JSON.stringify({
//             code: err.code,
//             message: err.message,
//             request: `${ctx.method} ${ctx.path}`
//         })
//     } else {
//         ctx.body = JSON.stringify({
//             code: 9999,
//             message: codeMessage.getMessage(9999),
//             request: `${ctx.method} ${ctx.path}`
//         })
//         console.log(err)
//     }
//    }
// }

export const error = async (err, ctx) => {
  ctx.type = 'application/json'
  if (err instanceof HttpException) {
    ctx.status = err.status || 500
    ctx.body = JSON.stringify({
      code: err.code,
      message: err.message,
      url: `${ctx.method} ${ctx.path}`
    })
    writeLog(err.message, ctx)
  } else {
    ctx.status = 500
    ctx.body = JSON.stringify({
      code: 9999,
      message: codeMessage.getMessage(9999),
      request: `${ctx.method} ${ctx.path}`
    })
    console.log(err)
    logger.debug(err)
    writeLog(codeMessage.getMessage(9999), ctx)
  }
}
