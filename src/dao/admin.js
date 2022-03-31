import { has, set, get } from 'lodash'

const { Op } = require('sequelize')
const { GroupModel } = require('../model/group')
const { GroupMenuPermissionModel } = require('../model/group-menu-permission')
const { PermissionModel } = require('../model/permission')
const { Forbidden, NotFound } = require('../lib/http-exception')
const { GroupPermissionModel } = require('../model/group-permission')

import { MountType } from '@/lib/type.js'
const { sequelize } = require('../lib/db')
class AdminDao {
  async getAllPermissions(ctx) {
    // 查询所有可分配的权限
    let allPermisions = await PermissionModel.findAll({
      where: {
        mount: MountType.Mount
      }
    })
    return this.formatPermission(allPermisions)
  }
  formatPermission(data) {
    let map = {}
    data.forEach(item => {
      let module = item.dataValues.module
      let _item = item.dataValues
      if (!map[module]) {
        map[module] = {
          name: module,
          children: [
            {
              id: _item.id,
              name: _item.name
            }
          ]
        }
      } else {
        map[module].children.push({
          id: _item.id,
          name: _item.name
        })
      }
    })
    let arr = []
    Reflect.ownKeys(map).forEach(key => arr.push(map[key]))
    return arr
  }
  async dispatchMenuPermissions(v) {
    const id = v.get('path.id')
    const menu_ids = v.get('body.menu_ids')
    const group = await GroupModel.findByPk(id)
    if (!group) throw new NotFound(10024)
    let transaction
    try {
      transaction = await sequelize.transaction()
      await GroupMenuPermissionModel.destroy(
        {
          where: {
            group_id: id
          }
        },
        transaction
      )
      for (let menuId of menu_ids) {
        await GroupMenuPermissionModel.create(
          {
            menu_id: menuId,
            group_id: id
          },
          transaction
        )
      }
      await transaction.commit()
    } catch (error) {
      console.log(error)
      transaction && transaction.rollback()
    }
  }

  async dispatchPermissions(v) {
    const group_id = v.get('path.id')
    const permission_ids = v.get('body.permission_ids')
    const group = await GroupModel.findByPk(group_id)
    if (!group) {
      throw new NotFound({
        code: 10024
      })
    }
    for (const id of permission_ids) {
      const permission = await PermissionModel.findOne({
        where: {
          id,
          mount: MountType.Mount
        }
      })
      if (!permission) {
        throw new NotFound({
          code: 10231
        })
      }
    }
    let transation
    try {
      transation = await sequelize.transaction()
      await GroupPermissionModel.destroy(
        {
          where: {
            group_id: group_id
          }
        },
        {
          transation
        }
      )
      for (const id of permission_ids) {
        await GroupPermissionModel.create(
          {
            group_id: group.id,
            permission_id: id
          },
          {
            transation
          }
        )
      }
      await transation.commit()
    } catch (err) {
      console.log(err)
      if (transation) await transation.rollback()
    }
  }

  async removePermissions(ctx) {
    const info = ctx.request.body
    const group = await GroupModel.findByPk(info.group_id)
    if (!group) {
      throw new NotFound({
        code: 10024
      })
    }
    for (const id of info.permission_ids || []) {
      const permission = await PermissionModel.findOne({
        where: {
          id,
          mount: MountType.Mount
        }
      })
      if (!permission) {
        throw new NotFound({
          code: 10231
        })
      }
    }
    await GroupPermissionModel.destroy({
      where: {
        group_id: group.id,
        permission_id: {
          [Op.in]: info.permission_ids
        }
      }
    })
  }
}

module.exports = { AdminDao }
