import { Op } from 'sequelize'
import { AuthFailed, NotFound } from 'koa-cms-lib'
import { UserModel } from '@/model/user.js'
import { GroupModel } from '@/model/group'
import { UserGroupModel } from '@/model/user-group'
import { PermissionModel } from '@/model/permission'
import { GroupPermissionModel } from '@/model/group-permission'
import { GroupLevel, RefreshException, routeMetaInfo } from '@/lib'
import { parseHeader } from '@/util/token'
async function mountUser(ctx) {
  const { identity } = parseHeader(ctx)
  const user = await UserModel.findByPk(identity)
  if (!user) {
    throw new NotFound({
      code: 10021,
    })
  }

  ctx.currentUser = user
}

async function isAdmin(ctx) {
  const userGroup = await UserGroupModel.findAll({
    where: {
      user_id: ctx.currentUser.id,
    },
  })
  const userGroupIds = userGroup.map(item => item.group_id)
  const root = await GroupModel.findOne({
    where: {
      level: GroupLevel.Root,
      id: {
        [Op.in]: userGroupIds,
      },
    },
  })
  return !!root
}

export async function refreshTokenRequiredWithUnifyException(ctx, next) {
  if (ctx.method !== 'OPTIONS') {
    try {
      const { identity } = parseHeader(ctx, 'refresh')
      const user = await UserModel.findByPk(identity)
      if (!user) {
        throw new NotFound({
          code: 10021,
        })
      }
      ctx.currentUser = user
    }
    catch (error) {
      console.log(error)
      throw new RefreshException()
    }
    await next()
  }
  else {
    await next()
  }
}

export async function loginRequired(ctx, next) {
  if (ctx.request.method !== 'OPTIONS') {
    await mountUser(ctx)
    await next()
  }
  else {
    await next()
  }
}

export async function adminRequired(ctx, next) {
  if (ctx.request.method !== 'OPTIONS') {
    await mountUser(ctx)
    if (isAdmin(ctx)) {
      await next()
    }
    else {
      throw new AuthFailed({
        code: 10001,
      })
    }
  }
  else {
    await next()
  }
}

export async function groupRequired(ctx, next) {
  if (ctx.request.method !== 'OPTIONS') {
    await mountUser(ctx)
    if (await isAdmin(ctx)) {
      await next()
    }
    else {
      if (ctx.matched) {
        const routeName = ctx._matchedRouteName || ctx.routerName
        const endpoint = `${ctx.method} ${routeName}`
        const { permission, module } = routeMetaInfo.get(endpoint)

        const userGroup = await UserGroupModel.findAll({
          where: {
            user_id: ctx.currentUser.id,
          },
        })
        const userGroupIds = userGroup.map(item => item.group_id)
        const groupPermission = await GroupPermissionModel.findAll({
          where: {
            group_id: {
              [Op.in]: userGroupIds,
            },
          },
        })
        const groupPermissionIds = groupPermission.map(item => item.permission_id)
        const item = await PermissionModel.findOne({
          where: {
            name: permission,
            module,
            id: {
              [Op.in]: groupPermissionIds,
            },
          },
        })

        if (item) {
          console.log('222')
          await next()
        }
        else {
          throw new AuthFailed({
            code: 10001,
          })
        }
      }
      else {
        throw new AuthFailed({
          code: 10001,
        })
      }
    }
  }
  else {
    await next()
  }
}
