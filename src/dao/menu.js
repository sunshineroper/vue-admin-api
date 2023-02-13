import { NotFound } from 'koa-cms-lib'
import { sequelize } from '@/lib'
const { Op } = require('sequelize')
const { MenuModel } = require('../model/menu')
class MenuDao {
  async createMenu(v, ctx) {
    const menu = await MenuModel.findOne({
      where: {
        [Op.or]: [{ path: v.get('body.path') }, { name: v.get('body.name') }],
      },
    })
    if (menu) {
      throw new Forbidden({
        code: 10252,
      })
    }
    const _menu = new MenuModel()
    _menu.name = v.get('body.name')
    _menu.title = v.get('body.title')
    _menu.icon = v.get('body.icon')
    _menu.component = v.get('body.component')
    _menu.parent_id = v.get('body.parent_id')
    _menu.path = v.get('body.path')
    _menu.hidden = v.get('body.hidden')
    _menu.menu_type = v.get('body.menu_type')
    _menu.keep_alive = v.get('body.keep_alive')
    _menu.isNav = v.get('body.is_nav')
    await _menu.save()
    return true
    // await MenuGroupModel.create({
    // })
  }

  async findAllMenu(ctx) {
    return await MenuModel.findAll()
  }

  async deletenMenu(id) {
    const menu = await MenuModel.findByPk(id)
    if (!menu) {
      throw new NotFound({
        code: 10253,
      })
    }
    let transaction
    try {
      transaction = await sequelize.transaction()
      await menu.destroy({ transaction })
      await MenuModel.destroy(
        {
          where: {
            parent_id: id,
          },
        },
        {
          transaction,
        },
      )
      await transaction.commit()
    }
    catch (error) {
      console.log(error)
      if (transaction)
        await transaction.rollback()
    }
  }

  async findMenuById(id) {
    const menu = await MenuModel.findByPk(id)
    if (!menu) {
      throw new NotFound({
        code: 10253,
      })
    }
    return menu
  }

  async updateMenu(v) {
    const menu = await MenuModel.findByPk(v.get('path.id'))
    if (!menu) {
      throw new NotFound({
        code: 10253,
      })
    }
    menu.name = v.get('body.name')
    menu.title = v.get('body.title')
    menu.icon = v.get('body.icon')
    menu.component = v.get('body.component')
    menu.parent_id = v.get('body.parent_id')
    menu.path = v.get('body.path')
    menu.hidden = v.get('body.hidden')
    menu.menutype = v.get('body.menutype')
    menu.keep_alive = v.get('body.keep_alive')
    await menu.save()
  }

  async batchDeleteMenu(v) {
    let ids = v.get('body.ids')
    ids = ids.map(id => +id)
    await MenuModel.destroy({
      where: {
        [Op.or]: [{ id: { [Op.in]: [...ids] } }, { parent_id: { [Op.in]: [...ids] } }],
      },
    })
  }
}

export { MenuDao }
