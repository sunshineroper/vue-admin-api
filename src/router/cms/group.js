import { SRouter } from '@/lib'
import { adminRequired } from '@/middleware/jwt'
import { GroupDao } from '@/dao/group'
import { NewGroupValidator } from '@/validator/admin'
const groupRouter = new SRouter({
  prefix: '/cms/group',
  module: '用户组'
})
const groupDao = new GroupDao()

groupRouter.sPost('createGroup', '/createGroup', groupRouter.permission('新建分组'), adminRequired, async ctx => {
  const v = await new NewGroupValidator().validate(ctx)
  const ok = await groupDao.createGrpup(v)
  if (!ok) {
    throw new Failed({
      code: 10027
    })
  }
  ctx.success({
    code: 15
  })
})

groupRouter.sGet('groupAll', '/', groupRouter.permission('获取所有分组'), adminRequired, async ctx => {
  const allGroups = await groupDao.getAllGroups()
  ctx.json(allGroups)
})

groupRouter.sPut('updateGroup', '/:id', groupRouter.permission('更新一个权限组'), adminRequired, async ctx => {
  await groupDao.updateGrpup(ctx)
  ctx.success({
    code: 7
  })
})
groupRouter.sGet('getGroup', '/:id', groupRouter.permission('查询一个权限组及其权限'), adminRequired, async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const permissions = await groupDao.getGroup(v)
  ctx.json(permissions)
})

groupRouter.sDelete('removeGroup', '/:id', groupRouter.permission('删除权限组'), adminRequired, async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  await groupDao.removeGroup(v)
  ctx.success({
    code: 8
  })
})

export { groupRouter }
