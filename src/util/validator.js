import { get, unset, cloneDeep } from 'lodash'
import validator1 from 'validator'
import { getAllFieldNames, getAllMethods } from '../util'
import { HttpException, ParametersException } from '../lib'

export class Validator {
  constructor() {
    this.errors = []
  }
  async validate(ctx, alias = {}) {
    this.alias = alias
    this.data = {
      body: ctx.request.body,
      query: ctx.request.query,
      path: ctx.params,
      header: ctx.request.header
    }
    let tempData = cloneDeep(this.data)
    this.parsed = {
      ...tempData,
      default: {}
    }
    let obj = {}
    if (!(await this.checkRules())) {
      if (this.errors.length === 1) {
        obj = this.errors[0].message
      } else {
        for (const err of this.errors) {
          obj[err.key] = err.message
        }
      }
      throw new ParametersException({ message: obj })
    } else {
      ctx.v = this
      return this
    }
  }
  async checkRules() {
    // 获取当前对象的所有符合校验写法的值
    let keys = getAllFieldNames(this, {
      filter: key => {
        let value = this[key]
        if (Array.isArray(value)) {
          if (value.length <= 0) {
            return false
          }
          for (const it of value) {
            if (!it instanceof Rule) {
              return false
            }
          }
          return true
        } else {
          return value instanceof Rule
        }
      }
    })
    // 如果该属性传递了别名,进行别名替换别名替换
    keys = this._replace(keys)
    for (const key of keys) {
      // 获取该对象要校验的属性的 koa-router的上的对象 和具体传递的值
      let [dataKey, dataVal] = this._findKeyAndDate(key)
      const value = this[key]
      let stoppedFlag = false
      let optional = false
      let defaultValue
      // 如果传递的参数是 null undefined "" 的话 判断此函数的校验规则是否有isOptional函数
      if (this.isOptional(dataVal)) {
        let message
        if (Array.isArray(value)) {
          for (const it of value) {
            if (it.optional) {
              optional = true
              defaultValue = it.defaultValue
            } else {
              if (!message) {
                message = it.message
              }
            }
          }
        } else {
          if (value.optional) {
            optional = true
            defaultValue = value.defaultValue
          } else {
            message = value.message
            optional = false
          }
        }
        // 如果此属性的值 有isOption函数表示,则记录他的默认值
        if (optional) {
          this.parsed['default'][key] = defaultValue
        } else {
          this.errors.push({ key, message })
        }
      } else {
        if (Array.isArray(value)) {
          let errs = []
          for (const it of value) {
            if (!stoppedFlag && !it.optional) {
              let valid
              valid = await it.validate(dataVal)
              if (!valid) {
                errs.push(it.message)
                stoppedFlag = true
              }
              if (errs.length !== 0) {
                this.errors.push({
                  key,
                  message: errs
                })
              }
            }
          }
        } else {
          let errs = []
          if (!stoppedFlag && !value.optional) {
            let valid
            valid = await value.validate(dataVal)
            if (!valid) {
              errs.push(value.message)
              stoppedFlag = true
            }
            // 如果有参数转换的值.需要记录
            if (value.parsedValue !== void 0) {
              this.parsed[dataKey][key] = value.parsedValue
            }
            if (errs.length !== 0) {
              this.errors.push({
                key,
                message: errs
              })
            }
          }
        }
      }
    }

    let validateFuncKeys = getAllMethods(this, {
      filter: key => {
        return /validate([A-Z])\w+/g.test(key) && typeof this[key] === 'function'
      }
    })
    for (const validateFuncKey of validateFuncKeys) {
      let customerValidateFunc = get(this, validateFuncKey)
      let valid
      try {
        valid = await customerValidateFunc.call(this, this.data)
        if (Array.isArray(valid) && !valid[0]) {
          let key
          if (valid[2]) {
            key = valid[2]
          } else {
            key = this.getValidateFuncKey(validateFuncKey)
          }
          this.errors.push({ key, message: valid[1] })
        } else if (!valid) {
          let key = this.getValidateFuncKey(validateFuncKey)
          this.errors.push({ key, message: '参数错误' })
        }
      } catch (error) {
        const key = this.getValidateFuncKey(validateFuncKey)
        if (error instanceof HttpException) {
          this.errors.push({ key, message: error.message })
        } else {
          this.errors.push({ key, message: error.message })
        }
      }
    }
    return this.errors.length === 0
  }

  getValidateFuncKey(key) {
    return key.replace('validate', '')
  }
  _findKeyAndDate(key) {
    let keys = Object.keys(this.parsed)
    for (const k of keys) {
      let val = get(this.parsed[k], key)
      if (val !== void 0) {
        return [k, val]
      }
    }
    return []
  }

  // 替换alias别名
  _replace(keys) {
    if (!this.alias) {
      return keys
    }
    let arr = []
    for (const key of keys) {
      if (this.alias[key]) {
        this[this.alias[key]] = this[key]
        unset(this, key)
        arr.push(this.alias[key])
      } else {
        arr.push(key)
      }
    }
    return arr
  }

  isOptional(val) {
    if (val === void 0) {
      return true
    }
    if (val === null) {
      return true
    }
    if (typeof val === 'string') {
      if (val.trim() === '' || val === '') {
        return true
      }
    }
    return false
  }
  // 取值
  get(path, parsed = true) {
    let defaultVal
    if (arguments.length >= 3) {
      defaultVal = arguments[2]
    }
    if (parsed) {
      let key = get(this.parsed, path, defaultVal)
      if (!this.isOptional(key)) {
        return key
      } else {
        let index = path.lastIndexOf('.')
        let suffix = path.substring(index + 1, path.length)
        return get(this.parsed['default'], suffix, defaultVal && defaultVal)
      }
    } else {
      return get(this.data, path, defaultVal)
    }
  }
}

export class Rule {
  constructor(validateFunction, message, ...options) {
    this.validateFunction = validateFunction
    this.message = message
    this.options = options
    if (validateFunction === 'isOptional') {
      this.optional = true
      this.defaultValue = options && options[0]
    }
  }
  validate(value) {
    if (typeof this.validateFunction === 'function') {
      return this.validateFunction(value, ...this.options)
    } else {
      switch (this.validateFunction) {
        case 'isInt':
          if (typeof value === 'string') {
            this.parsedValue = validator1.toInt(value)
            return validator1.isInt(value, ...this.options)
          } else {
            this.parsedValue = value
            return validator1.isInt(String(value), ...this.options)
          }
        case 'isNotEmpty':
          return !validator1.isEmpty(value, ...this.options)
        default:
          return validator1[this.validateFunction](value, ...this.options)
      }
    }
  }
}
