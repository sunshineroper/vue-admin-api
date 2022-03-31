import { Validator, Rule } from '../util/validator'

export class PositiveIdValidator extends Validator {
    constructor () {
        super()
        this.id = new Rule('isInt', 'id不能为空', { min: 1})
    }
}
