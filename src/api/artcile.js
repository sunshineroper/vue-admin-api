import Router from 'koa-router'
const articleRouter = new Router({
  prefix: '/article',
})
articleRouter.get('/', async (ctx) => {
  ctx.success()
})
