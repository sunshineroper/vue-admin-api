import { Model, Sequelize } from 'sequelize'
import { merge } from 'lodash'
import { sequelize, NotFound, AuthFailed } from '../lib'
import { InforCrudMixin } from '../util/inforCrudMixin'
import { verify } from '../util'
import { has, get } from 'lodash'

class UserIdentity extends Model {
  checkPassword(raw) {
    if (!this.credential || this.credential === '') {
      return false
    }
    return verify(raw, this.credential)
  }
  static async verify(username, password) {
    const user = await this.findOne({
      where: {
        identity_type: 'USERNAME_PASSWORD',
        identifier: username
      }
    })
    if (!user) {
      throw new NotFound({ code: 10021 })
    }
    if (!user.checkPassword(password)) {
      throw new AuthFailed({
        code: 10031
      })
    }
    return user
  }
}

UserIdentity.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '用户id'
    },
    identity_type: {
      type: Sequelize.STRING({ length: 100 }),
      allowNull: false,
      comment: '登录类型（手机号 邮箱 用户名）或第三方应用名称（微信 微博等）'
    },
    identifier: {
      type: Sequelize.STRING({ length: 100 }),
      comment: '标识（手机号 邮箱 用户名或第三方应用的唯一标识）'
    },
    credential: {
      type: Sequelize.STRING({ length: 100 }),
      comment: '密码凭证（站内的保存密码，站外的不保存或保存token）'
    }
  },
  merge(
    {
      sequelize,
      tableName: 'user_identity',
      modelName: 'user_identity'
    },
    InforCrudMixin.options
  )
)

class User extends Model {
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
      return { ...origin, menus: get(this, 'menus', []) }
    }
    return origin
  }
}

User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING({ length: 24 }),
      allowNull: false,
      comment: '用户名，唯一'
    },
    nickname: {
      type: Sequelize.STRING({ length: 24 }),
      comment: '用户昵称'
    },
    avatar: {
      type: Sequelize.STRING({ length: 500 }),
      comment: '头像url'
    },
    email: {
      type: Sequelize.STRING({ length: 100 }),
      allowNull: true
    }
  },
  merge(
    {
      sequelize,
      tableName: 'user',
      modelName: 'user'
      // indexes: [
      //   {
      //     name: 'username_del',
      //     unique: true,
      //     // fields: ['username', 'delete_time']
      //   },
      //   {
      //     name: 'email_del',
      //     unique: true,
      //     // fields: ['email', 'delete_time']
      //   }
      // ]
    },
    InforCrudMixin.options
  )
)

export { UserIdentity as UserIdentityModel, User as UserModel }
