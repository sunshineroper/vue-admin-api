import jwtGenerator from 'jsonwebtoken'
import { AuthFailed, ExpiredTokenException, InvalidTokenException } from '../lib'
import { get } from 'lodash'
class Token {
  constructor(secret, accessExp, refreshExp) {
    secret && (this.secret = secret)
    accessExp && (this.accessExp = accessExp)
    refreshExp && (this.refreshExp = refreshExp)
  }

  createAccessToken(identity) {
    if (!this.secret) {
      throw new Eroor('secret can not be empty')
    }
    let exp = Math.floor(+new Date() / 1000) + this.accessExp
    return jwtGenerator.sign(
      {
        exp,
        identity,
        type: 'access',
        scope: 'sun'
      },
      this.secret
    )
  }

  createRefreshToken(identity) {
    if (!this.secret) {
      throw new Eroor('secret can not be empty')
    }
    let exp = Math.floor(+new Date() / 1000) + this.refreshExp
    return jwtGenerator.sign(
      {
        exp,
        identity,
        type: 'refresh',
        scope: 'sun'
      },
      this.secret
    )
  }

  verifyToken(token, type = 'access') {
    if (!this.secret) {
      throw new Eroor('secret can not be empty')
    }
    let decode
    try {
      decode = jwtGenerator.verify(token, this.secret)
    } catch (error) {
      if (error instanceof jwtGenerator.TokenExpiredError) {
        if (type === 'access') {
          throw new ExpiredTokenException({
            code: 10051
          })
        } else if (type === 'refresh') {
          throw new ExpiredTokenException({
            code: 10052
          })
        } else {
          throw new ExpiredTokenException()
        }
      } else {
        if (type === 'access') {
          throw new InvalidTokenException({
            code: 10041
          })
        } else if (type === 'refresh') {
          throw new InvalidTokenException({
            code: 10042
          })
        } else {
          throw new InvalidTokenException()
        }
      }
    }
    return decode
  }
}

const config = {
  secret: '\x88W\xf09\x91\x07\x98\x89\x87\x96\xa0A\xc68\xf9\xecJJU\x17\xc5V\xbe\x8b\xef\xd7\xd8\xd3\xe6\x95*4',
  accessExp: 30 * 60,
  refreshExp: 30 * 24 * 60 * 10
}

let jwt = new Token(config.secret, config.accessExp, config.refreshExp)

export function parseHeader(ctx, type = 'access') {
  if (!ctx || !ctx.header.authorization) {
    ctx.throw(new AuthFailed())
  }
  const parts = ctx.header.authorization.split(' ')
  if (parts.length === 2) {
    const scheme = parts[0]
    const token = parts[1]

    if (/^Bearer$/i.test(scheme)) {
      const obj = jwt.verifyToken(token, type)
      if (!get(obj, 'type') || get(obj, 'type') !== type) {
        ctx.throw(new AuthFailed({ code: 10250 }))
      }
      if (!get(obj, 'scope') || get(obj, 'scope') !== 'sun') {
        ctx.throw(new AuthFailed({ code: 10251 }))
      }
      return obj
    }
  } else {
    ctx.throw(new AuthFailed())
  }
}
export function getTokens(id) {
  const accessToken = jwt.createAccessToken(id)
  const refreshToken = jwt.createRefreshToken(id)
  return { accessToken, refreshToken }
}
