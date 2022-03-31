import fs from 'fs'
import { unset } from 'lodash'
import passwordHash from 'password-hash'
export const readFile = (dir) => {
   let res = []
   const files = fs.readdirSync(dir)
   for (const file of files) {
       const name = dir + '/' + file
       if (fs.statSync(name).isDirectory()) {
           const tmp = readFile(name)
           res = res.concat(tmp)
       } else {
           res.push(name)
       }
   }
   return res
}

export const unsets = (obj, props) => {
    props.forEach(prop => {
        unset(obj, prop)
    })
}

export const getAllMethods = (obj, option) => {
    let methods = new Set()
    while((obj = Reflect.getPrototypeOf(obj))) {
        let keys = Reflect.ownKeys(obj)
        keys.forEach(key => methods.add(key))
    }
    return getPreFixAndFilter(Array.from(methods), option)
}
export const getAllFieldNames = (obj, option) => {
    let keys = Reflect.ownKeys(obj)
    return getPreFixAndFilter(keys, option)
}

export const getPreFixAndFilter = (keys, option) => {
    option && option.prefix && (keys = keys.filter(key => key.toString().startsWith() === option.prefix))
    option.filter && (keys = keys.filter(option.filter))
    return keys
}


export const generate = (val) => {
    return passwordHash.generate(val)
}

export const verify = (password, hashedPassword) => {
    return passwordHash.verify(password, hashedPassword)
}

export const isOptional= (val) => {
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


export const get = (obj, path, defaultVal) => {
    defaultVal === null ? undefined : defaultVal
    let len, i = 0
    if (Array.isArray(path)) {
        len = path.length
    } else {
        let tempPath = path.splice('.')
        len = tempPath.length
    }
    // Null Undefined 不是 object
    if (!!obj || typeof obj !== 'object') {
        return defaultVal
    }
    let tempObj = JSON.parse(JSON.stringify(obj))
    
    while (i < len - 1) {
        tempObj = tempObj[path[i]]
        i++
    }
    if (i === len - 1 && tempObj !== void 0) {
        return tempObj
    }
    return defaultVal 

}