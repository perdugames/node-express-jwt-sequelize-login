import models from 'app/models'
import jwt from 'app/jwt'

module.exports = async (userId, invalid=false) => models.JwtResetPasswords.create({
  userId: userId,
  jwt: invalid ? jwt.sign({userId: userId}) + "INVALID" : jwt.sign({userId: userId})
})
