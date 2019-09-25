require("dotenv-json")()
import fs from 'fs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const jwtKEY  = process.env.JWTKEY
const issuer  = 'Quasebuda'
const subject  = 'quasebuda@gmail.com'
const audience  = 'http://quasebuda.com'

const jwtOptions = {
 issuer: issuer,
 subject: subject,
 audience: audience,
 expiresIn: "1h"
}

module.exports = {
  sign: (payload, options=jwtOptions) => {
    payload.jwtSalt = crypto.randomBytes(16).toString('base64')
    return jwt.sign(payload, jwtKEY, options)
  },
  verify: (token, options=jwtOptions) => {
    try {
      return jwt.verify(token, jwtKEY, options)
    }catch(e) {
      return false
    }
  },
  decode: (token) => {
    return jwt.decode(token, {complete: true})
  }
}
