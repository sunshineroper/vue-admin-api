import { SRouter } from '@/lib/router'
import { NewMenuValidator, BatchDeleteMenuIdsValidator } from '@/validator/admin'
import { PositiveIdValidator } from '@/validator/common'
import { MenuDao } from '@/dao/menu'
import { adminRequired } from '@/lib'

const menuDao = new MenuDao()

const menuRoter = new SRouter({
  prefix: '/cms/menu'
})
menuRoter.sGet('findAllMenu', '/', adminRequired, async ctx => {
  let menus = await menuDao.findAllMenu(ctx)
  ctx.json(menus)
})

menuRoter.sPut('updateMenu', '/:id', adminRequired, async ctx => {
  await new PositiveIdValidator().validate(ctx)
  let v = await new NewMenuValidator().validate(ctx)
  await menuDao.updateMenu(v)
  ctx.success({
    code: 13
  })
})
menuRoter.sPost('batchDeleteMenu', '/batchDeleteMenu', adminRequired, async ctx => {
  let v = await new BatchDeleteMenuIdsValidator().validate(ctx)
  await menuDao.batchDeleteMenu(v)
  ctx.success({
    code: 14
  })
})
menuRoter.sDelete('deleteMenu', '/:id', adminRequired, async ctx => {
  let v = await new PositiveIdValidator().validate(ctx)
  await menuDao.deletenMenu(v.get('path.id'))
  ctx.success({
    code: 14
  })
})

menuRoter.sPost('createMenu', '/createMenu', adminRequired, async ctx => {
  let v = await new NewMenuValidator().validate(ctx)
  let ok = await menuDao.createMenu(v, ctx)
  if (ok) {
    ctx.success({
      code: 12
    })
  }
})

menuRoter.sGet('findMenuByid', '/:id', adminRequired, async ctx => {
  let v = await new PositiveIdValidator().validate(ctx)
  let menu = await menuDao.findMenuById(v.get('path.id'))
  ctx.json(menu)
})

export { menuRoter }
