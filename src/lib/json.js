const { HttpException } = require('./http-exception')
const { unsets } = require('../util/index')
export const json = (app) => {
    app.context.json = function (obj, hide = []){
        this.type = 'application/json'
        unsets(obj, hide)
        let data = Object.create(null)
        if (obj instanceof HttpException) {
        } else {
            data = obj
        }
        this.body = JSON.stringify(data)
    }
}