import { SRouter, generateToken } from 'koa-cms-lib'
import { loginRequired, refreshTokenRequiredWithUnifyException } from '@/middleware/jwt'
import { UserDao } from '@/dao/user'
import { PositiveIdValidator } from '@/validator/common'
import { LoginValidator, RegisterValidator, UpdateUserGroupValidator, UsersAllValidatator } from '@/validator/user'
const userDao = new UserDao()
const userRouter = new SRouter({
  module: '用户',
  prefix: '/cms/user',
  mountpermission: false,
})

userRouter.sGet('getUsers', '/all', loginRequired, async (ctx) => {
  const v = await new UsersAllValidatator().validate(ctx)
  const { users, total } = await userDao.getUsers(v)
  ctx.json({ users, total, count: v.get('query.count'), page: v.get('query.page') })
})

userRouter.sPost('login', '/login', userRouter.permission('登录'), async (ctx) => {
  const v = await new LoginValidator().validate(ctx)
  const { accessToken, refreshToken } = await userDao.getTokes(v, ctx)
  ctx.json({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
})

userRouter.sPut('updateUser', '/:id', loginRequired, async (ctx) => {
  const v = await new PositiveIdValidator().validate(ctx)
  await userDao.updateUser(v, ctx)
  ctx.success(6)
})

userRouter.sPut('/updateUserGroup/:id', loginRequired, async (ctx) => {
  const v = await new UpdateUserGroupValidator().validate(ctx)
  await userDao.updateUserGroup(v, ctx)
  ctx.success(9)
})

userRouter.sDelete('deleteUser', '/:id', userRouter.permission('删除用户'), loginRequired, async (ctx) => {
  const v = await new PositiveIdValidator().validate(ctx)
  await userDao.deleteUser(ctx, v)
  ctx.success(5)
})

userRouter.sGet('refresh', '/refresh', userRouter.permission('刷新令牌'), refreshTokenRequiredWithUnifyException, async (ctx) => {
  const user = ctx.currentUser
  const { accessToken, refreshToken } = generateToken(user.id)
  ctx.json({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
})

userRouter.sGet('permissions', '/permissions', userRouter.permission('获取用户的所有权限'), loginRequired, async (ctx) => {
  const permissions = await userDao.getPermissions(ctx)
  ctx.json(permissions)
})

userRouter.sPost('register', '/register', userRouter.permission('注册用户'), async (ctx) => {
  const v = await new RegisterValidator().validate(ctx)
  const isSusscess = await userDao.register(ctx, v)
  if (isSusscess) {
    ctx.success({
      code: 11,
    })
  }
  else {
    ctx.success({
      code: 10014,
    })
  }
})
userRouter.sGet('information', '/information', userRouter.permission('查询自己的用户信息'), loginRequired, async (ctx) => {
  const info = await userDao.getInformation(ctx)
  ctx.json(info)
})

module.exports = { userRouter }
