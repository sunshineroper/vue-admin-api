import { SRouter } from '@/lib/router'
import { groupRequired } from '@/middleware/jwt'
import { logger } from '@/middleware/logger'
const articleRouter = new SRouter({
  prefix: '/v1/artcile',
  module: '文章模块'
})

articleRouter.sGet('getAllList', '/', articleRouter.permission('获取所有文章'), logger('获取所有文章'), groupRequired, async ctx => {
})

articleRouter.sDelete('deleteArtcile', '/:id', articleRouter.permission('删除'), logger('删除文章'), groupRequired, async ctx => {
  console.log(c)
  ctx.success({ code: 9 })
})

articleRouter.sPost('新增文章', '/add', articleRouter.permission('新增'), logger('新增文章'), groupRequired, async ctx => {
  ctx.success({ code: 9 })
})


module.exports = { articleRouter }
