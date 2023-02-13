import { NotFound } from 'koa-cms-lib'
import { Op } from 'sequelize'
import { GroupModel } from '../model/group'
import { GroupMenuPermissionModel } from '../model/group-menu-permission'
import { PermissionModel } from '../model/permission'
import { GroupPermissionModel } from '../model/group-permission'
import { sequelize } from '../lib/db'
import { MountType } from '@/lib/type.js'
class AdminDao {
  async getAllPermissions() {
    // 查询所有可分配的权限
    const allPermissions = await PermissionModel.findAll({
      where: {
        mount: MountType.Mount,
      },
    })
    return this.formatPermission(allPermissions)
  }

  formatPermission(data) {
    const map = {}
    data.forEach((item) => {
      const module = item.dataValues.module
      const _item = item.dataValues
      if (!map[module]) {
        map[module] = {
          name: module,
          children: [
            {
              id: _item.id,
              name: _item.name,
            },
          ],
        }
      }
      else {
        map[module].children.push({
          id: _item.id,
          name: _item.name,
        })
      }
    })
    const arr = []
    Reflect.ownKeys(map).forEach(key => arr.push(map[key]))
    return arr
  }

  async dispatchMenuPermissions(ctx, v) {
    const id = v.get('path.id')
    const menu_ids = v.get('body.menu_ids')
    const group = await GroupModel.findByPk(id)
    if (!group)
      throw new NotFound(10024)
    let transaction
    try {
      transaction = await sequelize.transaction()
      await GroupMenuPermissionModel.destroy(
        {
          where: {
            group_id: id,
          },
        },
        transaction,
      )
      for (const menuId of menu_ids) {
        await GroupMenuPermissionModel.create(
          {
            menu_id: menuId,
            group_id: id,
          },
          transaction,
        )
      }
      await transaction.commit()
    }
    catch (error) {
      ctx.logger.error(error)
      transaction && transaction.rollback()
    }
  }

  async dispatchPermissions(ctx, v) {
    const group_id = v.get('path.id')
    const permission_ids = v.get('body.permission_ids')
    const group = await GroupModel.findByPk(group_id)
    if (!group) {
      throw new NotFound({
        code: 10024,
      })
    }
    for (const id of permission_ids) {
      const permission = await PermissionModel.findOne({
        where: {
          id,
          mount: MountType.Mount,
        },
      })
      if (!permission) {
        throw new NotFound({
          code: 10231,
        })
      }
    }
    let transation
    try {
      transation = await sequelize.transaction()
      await GroupPermissionModel.destroy(
        {
          where: {
            group_id,
          },
        },
        {
          transation,
        },
      )
      for (const id of permission_ids) {
        await GroupPermissionModel.create(
          {
            group_id: group.id,
            permission_id: id,
          },
          {
            transation,
          },
        )
      }
      await transation.commit()
    }
    catch (err) {
      ctx.logger.error(err)
      if (transation)
        await transation.rollback()
    }
  }

  async removePermissions(ctx) {
    const info = ctx.request.body
    const group = await GroupModel.findByPk(info.group_id)
    if (!group) {
      throw new NotFound({
        code: 10024,
      })
    }
    for (const id of info.permission_ids || []) {
      const permission = await PermissionModel.findOne({
        where: {
          id,
          mount: MountType.Mount,
        },
      })
      if (!permission) {
        throw new NotFound({
          code: 10231,
        })
      }
    }
    await GroupPermissionModel.destroy({
      where: {
        group_id: group.id,
        permission_id: {
          [Op.in]: info.permission_ids,
        },
      },
    })
  }
}

module.exports = { AdminDao }
