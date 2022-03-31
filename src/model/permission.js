import { Model, Sequelize, Op } from 'sequelize'
import { merge } from 'lodash'
import { sequelize } from '../lib'
import { routeMetaInfo } from '../lib'
import { InforCrudMixin } from '../util/inforCrudMixin'
import { GroupPermissionModel } from './group-permission'

class Permission extends Model {
  static async initpermission() {
    let transaction
    try {
      transaction = await sequelize.transaction()
      const info = Array.from(routeMetaInfo.values())
      const permissions = await this.findAll()
      for (const { permission: permissionName, module: moduleName } of info) {
        const exist = permissions.find(p => p.name === permissionName && p.module === moduleName)
        if (!exist) {
          await this.create(
            {
              name: permissionName,
              module: moduleName
            },
            { transaction }
          )
        }
      }

      const permissionIds = []
      for (const permission of permissions) {
        const exist = info.find(meta => meta.permission === permission.name && meta.module === permission.module)
        if (exist) {
          permission.mount = 1
        } else {
          permission.mount = 0
          permissionIds.push(permission.id)
        }
        await permission.save({
          transaction
        })
      }
      if (permissionIds.length) {
        await GroupPermissionModel.destroy({
          where: {
            permission_id: {
              [Op.in]: permissionIds
            }
          }
        })
      }
      await transaction.commit()
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
    }
  }
  toJSON() {
    const origin = {
      id: this.id,
      username: this.username,
      nickname: this.nickname,
      email: this.email,
      avatar: !this.avatar ? 'https://s4.ax1x.com/2022/02/22/bSi4Gn.jpg' : this.avatar
    }
    if (has(this, 'groups')) {
      return { ...origin, groups: get(this, 'groups', []) }
    } else if (has(this, 'menus')) {
    }
    return origin
  }
}

Permission.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING({ length: 60 }),
      comment: '权限名称，例如：访问首页',
      allowNull: false
    },
    module: {
      type: Sequelize.STRING({ length: 50 }),
      comment: '权限所属模块，例如：人员管理',
      allowNull: false
    },
    mount: {
      type: Sequelize.INTEGER,
      comment: '0：关闭 1：开启',
      defaultValue: 1
    }
  },
  merge(
    {
      sequelize,
      tableName: 'permission',
      modelName: 'permission'
    },
    InforCrudMixin.options
  )
)

export { Permission as PermissionModel }
