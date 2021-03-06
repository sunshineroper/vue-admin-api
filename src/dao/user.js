import { Op } from 'sequelize'
import { GroupMenuPermissionModel } from '@/model/group-menu-permission'
import { MenuModel } from '@/model/menu'
import { GroupLevel, MountType, MENU_HIDDEN, sequelize, RepeatException, NotFound } from '@/lib'
import { has, set } from 'lodash'
const { UserModel, UserIdentityModel } = require('../model/user')
const { UserGroupModel } = require('../model/user-group')
const { GroupModel } = require('../model/group')

const { GroupPermissionModel } = require('../model/group-permission')
const { PermissionModel } = require('../model/permission')
const { generate } = require('../util')
const { getTokens } = require('../util/token')

class UserDao {
  async getTokes(v, ctx) {
    const user = await UserIdentityModel.verify(v.get('body.username'), v.get('body.password'))
    const { accessToken, refreshToken } = getTokens(user.user_id)
    return {
      accessToken,
      refreshToken
    }
  }
  async register(v) {
    const email = v.get('body.email')
    const groupIds = v.get('body.groupIds')
    const username = v.get('body.username')
    let user = await UserModel.findOne({
      where: {
        username: username
      }
    })
    if (user) {
      new RepeatException({
        code: 10071
      })
    }
    if (email) {
      let user = await UserModel.findOne({
        where: {
          email: email
        }
      })
      if (user) {
        new RepeatException({
          code: 10076
        })
      }
    }
    if (groupIds && groupIds.length > 0) {
      for (const id of groupIds) {
        let group = await GroupModel.findByPk(id)
        if (!group) {
          throw new NotFound({
            code: 10023
          })
        }
      }
    }

    let transaction
    try {
      transaction = await sequelize.transaction()
      let user = {
        username: username
      }
      if (email) {
        user.email = email
      }
      let { id: user_id } = await UserModel.create(user, { transaction })
      await UserIdentityModel.create(
        {
          user_id,
          identifier: username,
          identity_type: 'USERNAME_PASSWORD',
          credential: generate(v.get('body.password'))
        },
        {
          transaction
        }
      )
      if (groupIds && groupIds.length > 0) {
        for (const id of groupIds) {
          await UserGroupModel.create(
            {
              user_id,
              group_id: id
            },
            {
              transaction
            }
          )
        }
      } else {
        const guest = await GroupModel.findOne({
          where: {
            level: GroupLevel.Guest
          }
        })
        await UserGroupModel.create({
          user_id,
          group_id: guest.id
        })
      }

      await transaction.commit()
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
    }
  }
  async getUsers(v) {
    const page = v.get('query.page')
    const count1 = v.get('query.count')
    const condition = {
      where: {
        username: {
          [Op.ne]: 'root'
        }
      },
      offset: page * count1,
      limit: count1
    }
    const { rows, count } = await UserModel.findAndCountAll(condition)
    for (const user of rows) {
      const userGroup = await UserGroupModel.findAll({
        where: {
          user_id: user.id
        }
      })
      const groupIds = userGroup.map(v => v.group_id)
      const groups = await GroupModel.findAll({
        where: {
          id: {
            [Op.in]: groupIds
          }
        }
      })
      set(user, 'groups', groups)
    }
    return {
      users: rows,
      total: count
    }
  }

  async deleteUser(ctx) {
    let id = ctx.params.id
    let user = await UserModel.findByPk(id)
    if (!user) {
      throw new NotFound({
        code: 10021
      })
    }
    let user_group = await UserGroupModel.findOne({
      where: {
        user_id: id
      }
    })
    let transaction
    try {
      transaction = await sequelize.transaction()
      await user.destroy({
        transaction
      })
      await user_group.destroy({
        transaction
      })
      await UserIdentityModel.destroy(
        {
          where: {
            user_id: id
          }
        },
        {
          transaction
        }
      )
      await transaction.commit()
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
    }
  }

  async updateUserGroup(v, ctx) {
    const userid = v.get('path.id')
    const groupIds = v.get('body.group_ids')
    const user = UserGroupModel.findByPk(userid)
    if (!user) {
      return new NotFound(10024)
    }
    let transaction
    try {
      transaction = await sequelize.transaction()
      await UserGroupModel.destroy({
        where: {
          user_id: userid
        },
        transaction
      })
      if (groupIds && groupIds.length > 0) {
        for (let id of groupIds) {
          let group = await GroupModel.findByPk(id)
          if (!group) {
            ctx.success(new NotFound())
            return
          }
          await UserGroupModel.create(
            {
              group_id: id,
              user_id: userid
            },
            transaction
          )
        }
        await transaction.commit()
      }
    } catch (error) {
      console.log(error)
      transaction && transaction.rollback()
    }
  }
  async updateUser(v) {
    const userId = v.get('path.id')
    const user = await UserModel.findByPk(userId)
    if (!user) {
      throw new NotFound({
        code: 10021
      })
    }
    user.avatar = v.get('body.avatar')
    await user.save()
  }
  async deleteUser(v) {
    const userId = v.get('path.id')
    const user = await UserModel.findByPk(userId)
    if (!user) {
      throw new NotFound({
        code: 10021
      })
    }
    let transaction
    try {
      transaction = await sequelize.transaction()
      // ????????????????????????
      await UserGroupModel.destroy({
        where: {
          user_id: user.id
        },
        transaction
      })
      await UserIdentityModel.destroy(
        {
          where: {
            user_id: user.id
          }
        },
        {
          transaction
        }
      )
      await user.destroy({
        transaction
      })
      await transaction.commit()
    } catch (error) {
      transaction && (await transaction.callback())
    }
  }

  async getInformation(ctx) {
    const user = ctx.currentUser
    return user
  }

  async getPermissions(ctx) {
    const user = ctx.currentUser
    const userGroup = await UserGroupModel.findAll({
      where: {
        user_id: user.id
      }
    })
    const groupIds = userGroup.map(item => item.group_id)

    const root = await GroupModel.findOne({
      where: {
        level: GroupLevel.Root,
        id: {
          [Op.in]: groupIds
        }
      }
    })

    set(user.dataValues, 'admin', !!root)
    let permissons = []
    let menus = []
    if (root) {
      permissons = await PermissionModel.findAll({
        where: {
          mount: MountType.Mount
        }
      })
      menus = await MenuModel.findAll({
        where: {
          hidden: 0
        }
      })
    } else {
      const groupPermission = await GroupPermissionModel.findAll({
        where: {
          group_id: {
            [Op.in]: groupIds
          }
        }
      })
      const groupPermission_ids = groupPermission.map(item => item.permission_id)
      permissons = await PermissionModel.findAll({
        where: {
          mount: MountType.Mount,
          id: {
            [Op.in]: groupPermission_ids
          }
        }
      })
      // ??????????????????
      const menuPermission = await GroupMenuPermissionModel.findAll({
        where: {
          group_id: {
            [Op.in]: groupIds
          }
        }
      })
      const menuPermission_ids = menuPermission.map(item => item.menu_id)
      menus = await MenuModel.findAll({
        where: {
          hidden: MENU_HIDDEN.UNHIDDEN,
          id: {
            [Op.in]: menuPermission_ids
          }
        }
      })
    }
    set(user.dataValues, 'menus', menus)
    return set(user.dataValues, 'permissions', this.formatPermissions(permissons))
  }

  formatPermissions(permissions) {
    let map = {}
    permissions.forEach(item => {
      let module = item.module
      if (has(map, module)) {
        map[module].push({
          permission: item.name,
          module
        })
      } else {
        set(map, module, [
          {
            permission: item.name,
            module
          }
        ])
      }
    })
    return map
    // return Object.keys(map).map(item => {
    //     let temp = Object.create(null)
    //     set(temp, item, map[item])
    //     return temp
    // })
  }
}

module.exports = { UserDao }
