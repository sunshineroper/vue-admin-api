import { Op } from 'sequelize'
import { Forbidden, NotFound } from 'koa-cms-lib'
import { set } from 'lodash'
import { sequelize } from '@/lib'
import { GroupModel } from '@/model/group'
import { UserGroupModel } from '@/model/user-group'
import { GroupLevel, MountType } from '@/lib/type.js'
import { GroupMenuPermissionModel } from '@/model/group-menu-permission'
import { GroupPermissionModel } from '@/model/group-permission'
import { PermissionModel } from '@/model/permission'
class GroupDao {
  async createGroup(v) {
    let group = await GroupModel.findOne({
      where: {
        name: v.get('body.name'),
      },
    })
    if (group) {
      throw new Forbidden({
        code: 10072,
      })
    }
    for (const id of v.get('body.permission_ids') || []) {
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
    let transaction
    try {
      transaction = await sequelize.transaction()

      group = await GroupModel.create(
        {
          name: v.get('body.name'),
          info: v.get('body.info'),
        },
        { transaction },
      )
      for (const id of v.get('body.permission_ids') || []) {
        await GroupPermissionModel.create(
          {
            group_id: group.id,
            permission_id: id,
          },
          {
            transaction,
          },
        )
      }
      await transaction.commit()
    }
    catch (err) {
      if (transaction)
        await transaction.rollback()
    }
    return true
  }

  async getAllGroups() {
    const allGroups = await GroupModel.findAll({
      where: {
        level: {
          [Op.ne]: GroupLevel.Root,
        },
      },
    })
    for (const group of allGroups) {
      const g = await GroupMenuPermissionModel.findAll({ where: { group_id: group.id } })
      const p = await GroupPermissionModel.findAll({ where: { group_id: group.id } })
      set(group, 'menu_permission', g)
      set(group, 'permission', p)
    }
    return allGroups
  }

  async updateGroup(ctx) {
    const group = await GroupModel.findByPk(ctx.params.id)
    if (!group) {
      throw new NotFound({
        code: 10024,
      })
    }
    group.name = ctx.request.body.name
    group.info = ctx.request.body.info
    await group.save()
  }

  async getGroup(v) {
    const group = await GroupModel.findByPk(v.get('path.id'))
    if (!group) {
      throw new NotFound({
        code: 10024,
      })
    }
    const groupPermission = await GroupPermissionModel.findAll({
      where: {
        group_id: v.get('path.id'),
      },
    })
    const permissionIds = groupPermission.map(v => v.permission_id)

    const permissions = await PermissionModel.findAll({
      where: {
        mount: MountType.Mount,
        id: {
          [Op.in]: permissionIds,
        },
      },
    })
    return set(group.dataValues, 'permissions', permissions)
  }

  async removeGroup(v) {
    const id = v.get('path.id')
    const group = await GroupModel.findByPk(id)
    if (!group) {
      throw new NotFound({
        code: 10024,
      })
    }
    let transaction
    try {
      transaction = await sequelize.transaction()
      await GroupModel.destroy({
        where: {
          id,
        },
        transaction,
      })
      await GroupPermissionModel.destroy({
        where: {
          group_id: id,
        },
        transaction,
      })
      await UserGroupModel.destroy({
        where: {
          group_id: id,
        },
        transaction,
      })
      transaction.commit()
    }
    catch (error) {
      console.log(error)
      if (transaction)
        await transaction.rollback()
    }
  }

  async getGroupByName(ctx) {
    const group = await GroupModel.findOne({
      where: {
        name: ctx.request.name,
      },
    })
    return group
  }
}

export { GroupDao }
