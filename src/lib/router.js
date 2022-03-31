import Router from 'koa-router'
import { isBoolean, isFunction } from 'lodash'
export const routeMetaInfo = new Map()

export class SRouter extends Router {
  constructor(options) {
    super(options)
    if (options) {
      this.mountpermission = true // 默认挂载
      this.prefix = options.prefix || ''
      if (options.module) {
        this.module = options.module
      }
      if (isBoolean(options.mountpermission)) {
        this.mountpermission = options.mountpermission
      }
    }
  }

  permission(permission, mount) {
    return {
      permission,
      module: this.module,
      mount: isBoolean(mount) ? mount : this.mountpermission
    }
  }
  sGet(name, path, meta, ...middleware) {
    if (meta && meta.mount) {
      const endpoint = 'GET ' + name
      routeMetaInfo.set(endpoint, { permission: meta.permission, module: meta.module })
    }
    if (isFunction(meta)) {
      return this.get(name, path, meta, ...middleware)
    }
    return this.get(name, path, ...middleware)
  }

  sPost(name, path, meta, ...middleware) {
    if (meta && meta.mount) {
      const endpoint = 'POST ' + name
      routeMetaInfo.set(endpoint, { permission: meta.permission, module: meta.module })
    }
    if (isFunction(meta)) {
      return this.post(name, path, meta, ...middleware)
    }
    return this.post(name, path, ...middleware)
  }

  sPut(name, path, meta, ...middleware) {
    if (meta && meta.mount) {
      const endpoint = 'PUT ' + name
      routeMetaInfo.set(endpoint, { permission: meta.permission, module: meta.module })
    }
    if (isFunction(meta)) {
      return this.put(name, path, meta, ...middleware)
    }
    return this.put(name, path, ...middleware)
  }

  sDelete(name, path, meta, ...middleware) {
    if (meta && meta.mount) {
      const endpoint = 'DELETE ' + name
      routeMetaInfo.set(endpoint, { permission: meta.permission, module: meta.module })
    }
    if (isFunction(meta)) {
      return this.delete(name, path, meta, ...middleware)
    }
    return this.delete(name, path, ...middleware)
  }
}
