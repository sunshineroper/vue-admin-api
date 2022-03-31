import { get, has, set } from 'lodash'
const env = process.NODE_ENV || 'development'

const mod = require(`./${env}`)

class Config {
  constructor(config = {}) {
    this.store = config
  }
  getItem(key, val) {
    return get(this.store, key, val)
  }

  hasItem(key) {
    return has(this.store, key)
  }

  setItem(key, val) {
    return set(this.store, key, val)
  }
}

const config = new Config(mod)

export default config
