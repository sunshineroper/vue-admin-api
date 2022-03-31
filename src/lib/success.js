import { Success } from './http-exception'
export const success = app => {
  app.context.success = function (ex) {
    this.type = 'application/json'
    const success = new Success(ex)
    let data = {
      code: success.code,
      message: success.message,
      request: `${this.method} ${this.path}`
    }
    this.status = success.status
    this.body = JSON.stringify(data)
  }
}
