import validator from 'validator'
import { Validator, Rule } from '../util/validator'
export class NewGroupValidator extends Validator {
  constructor() {
    super()
    this.name = new Rule('isNotEmpty', '请输入分组名称')
    this.info = new Rule('isOptional')
  }

  async validatePermissionIds(val) {
    const ids = val.body.permission_ids
    if (!ids || !Array.isArray(ids)) {
      return [false, '请勾选至少一个权限']
    }
    for (let id of ids) {
      if (typeof id === 'number') {
        id = String(id)
      }
      if (!validator.isInt(id, { min: 1 })) {
        return [false, '每个id值必须为正整数']
      }
    }
    return true
  }
}

export class NewMenuValidator extends Validator {
  constructor() {
    super()
    this.name = new Rule('isNotEmpty', '菜单名称不能为空')
    this.path = new Rule('isNotEmpty', '菜单路由不能为空')
    this.component = new Rule('isNotEmpty', '组件路径不能为空')
    this.title = new Rule('isNotEmpty', '菜单名称不能为空')
    this.menutype = new Rule('isInt', '菜单类型必须为数值')
  }
}

export class BatchDeleteMenuIdsValidator extends Validator {
  constructor() {
    super()
  }
  async validatePermissionIds(val) {
    const ids = val.body.ids
    if (!ids || !Array.isArray(ids)) {
      return [false, '请至少选择一个菜单']
    }
    for (let id of ids) {
      if (typeof id === 'number') {
        id = String(id)
      }
      if (!validator.isInt(id, { min: 1 })) {
        return [false, '每个id必须为数值']
      }
    }
    return true
  }
}

export class dispatchPermissionsValidator extends Validator {
  constructor() {
    super()
    this.id = new Rule('isNotEmpty', '分组id不能为空')
  }
}
