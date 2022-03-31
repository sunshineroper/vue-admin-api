import { dispatchPermissionsValidator } from '@/validator/admin'
import { SRouter } from '@/lib/router'
import { AdminDao } from '@/dao/admin'
import { adminRequired } from '@/middleware/jwt'
import { PositiveIdValidator } from '@/validator/common.js'

const adminDao = new AdminDao()

const adminRouter = new SRouter({
  module: '管理员',
  prefix: '/cms/admin',
  mountpermission: false
})

adminRouter.sPut('dispatchMenuPermissions', '/dispatchMenuPermissions/:id', adminRouter.permission('更新分组的菜单权限'), async ctx => {
  let v = await new PositiveIdValidator().validate(ctx)
  await adminDao.dispatchMenuPermissions(v)
  ctx.success({
    code: 16
  })
})

adminRouter.sGet('getAllPermissions', '/permission', adminRouter.permission('获取所有可分配的权限'), adminRequired, async ctx => {
  let data = await adminDao.getAllPermissions(ctx)
  ctx.json(data)
})

adminRouter.sPut('dispatchPermissions', '/permission/:id', adminRouter.permission('分配权限'), adminRequired, async ctx => {
  let v = await new dispatchPermissionsValidator().validate(ctx)
  await adminDao.dispatchPermissions(v)
  ctx.success({
    code: 17
  })
})

adminRouter.sPost('removePermissions', '/permission/remove', adminRouter.permission('删除多个权限'), adminRequired, async ctx => {
  await adminDao.removePermissions(ctx)
  ctx.success({
    code: 10
  })
})

module.exports = { adminRouter }
