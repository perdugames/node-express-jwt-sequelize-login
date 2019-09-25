import models from 'app/models'
import jwt from 'app/jwt'

module.exports = async (userId, invalid=false) => models.JwtUserSessions.create({
  userId: userId,
  jwt: invalid ? jwt.sign({userId: userId}) + "INVALID" : jwt.sign({userId: userId})
})
