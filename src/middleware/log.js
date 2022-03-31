import { NotFound, MethodNotAllowed, HttpException } from '@/lib'
export const log = async (ctx, next) => {
  const start = Date.now()
  try {
    await next()
    const ms = Date.now() - start
    ctx.set('X-Response-Time', `${ms}ms`)
    ctx.logger.info(`[${ctx.method}] -> [${ctx.url}] from: ${ctx.ip} consts ${ms}ms`)
    if (ctx.status === 404) {
      ctx.app.emit('error', new NotFound(), ctx)
    } else if (ctx.status === 405) {
      ctx.app.emit('error', new MethodNotAllowed(), ctx)
    }

  } catch (error) {
    const ms = Date.now() - start
    ctx.logger.info(`[${ctx.method}] -> [${ctx.url}] from: ${ctx.ip} consts ${ms}ms`)
    ctx.app.emit('error', error, ctx)
  }
}
