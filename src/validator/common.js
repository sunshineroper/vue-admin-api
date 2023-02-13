import { Rule, Validator } from 'koa-cms-lib'

export class PositiveIdValidator extends Validator {
  constructor() {
    super()
    this.id = new Rule('isInt', 'id不能为空', { min: 1 })
  }
}
