import { Rule, Validator } from 'koa-cms-lib'
import { isOptional } from '../util'
export class RegisterValidator extends Validator {
  constructor() {
    super()
    this.username = [new Rule('isNotEmpty', '用户名不能为空'), new Rule('isLength', '用户名长度必须在2-20之间', 2, 20)]
    this.email = [new Rule('isOptional'), new Rule('isEmail', '请输入正确的电子邮箱')]
    this.password = [
      new Rule(
        'matches',
        '密码长度最少6位,并且必须包含一位大写字母一位小写字母一位数字和一位特殊符号',
        /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/,
      ),
    ]
    this.confirm_password = new Rule('isNotEmpty', '确认密码不可为空')
  }

  validateConfirmPassword(data) {
    if (!data.body.password || !data.body.confirm_password)
      return [false, '两次输入的密码不一致，请重新输入']

    const ok = data.body.password === data.body.confirm_password
    if (ok)
      return ok

    else
      return [false, '两次输入的密码不一致，请重新输入']
  }

  validateGroupIds(data) {
    const groupIds = data.body.groupIds
    if (isOptional(groupIds))
      return true

    if (!Array.isArray(groupIds) && groupIds.length === 0)
      return [false, '至少选择一个分组']

    return true
  }
}

export class LoginValidator extends Validator {
  constructor() {
    super()
    this.username = new Rule('isNotEmpty', '用户名不能为空')
    this.password = new Rule('isNotEmpty', '密码不能为空')
  }
}
export class UpdateUserGroupValidator extends Validator {
  constructor() {
    super()
  }

  validateGroupIds(val) {
    const ids = val.body.group_ids
    for (let id of ids) {
      if (typeof id === 'number')
        id = String(id)

      // if (!Validator.isInt(id, { min: 1 })) {
      //   return [false, '每个id值必须为整数']
      // }
    }
    return true
  }
}

export class UsersAllValidatator extends Validator {
  constructor() {
    super()
    this.group_id = [new Rule('isOptional'), new Rule('isInt', 'id不能为空', { min: 1 })]
  }
}
