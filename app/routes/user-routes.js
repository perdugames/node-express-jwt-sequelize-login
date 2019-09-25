import express from 'express'
import {addAsync} from '@awaitjs/express'
import uuid from 'uuid/v4'
import {User, JwtUserSessions, JwtResetPasswords} from '../models'
import Encryption from '../encryption.js'
import jwt from '../jwt'
import auth from '../middlewares/auth'
import sendMail from '../mailer'

const router = addAsync(express.Router())

router.get('/', (req, res) => {
  res.send(JSON.stringify({status: 200, message: "Success."}))
})

router.postAsync('/signup', async (req, res) => {
  if(!req.body.username || !req.body.email || !req.body.password)
    res.status(400).json({status: 400, message: "Required fields were not sent."})
  const [user, created] = await User.findOrCreate({
    where: {email: req.body.email},
    defaults: {
      id: uuid(),
      username: req.body.username, 
      email: req.body.email, 
      password: Encryption.encrypt(req.body.password)
  }})
  if(!created)
    res.status(400).json({status: 400, message: "User already exists."})
  res.status(200).json({status: 200, message: "Signup success."})
})
         
router.postAsync('/signin', async (req, res) => {
  if(!req.body.email)
    res.status(401).json({status: 401, message: "Email required."})
  const user = await verifyPassword(req, res, {email: req.body.email})
  const userId = user.get().id
  const token = jwt.sign({userId: userId})
  await JwtUserSessions.create({
    userId: userId, 
    jwt: token
  })
  res.status(200).json({status: 200, message: "Signin success.", data: {jwt: token}})
})

router.post('/logout', auth, (req, res) => {
  JwtUserSessions.destroy({
    where: req.body.logoutAll ? {userId: res.jwtDecoded.userId} : {jwt: res.jwtToken}
  })
  .then(() => res.status(200).json({status: 200, message: "Logout success."}))
  .catch(() => res.status(400).json({status: 400, message: "Logout failed."}))    
})

router.postAsync('/update-password', auth, async (req, res, next) => {
  if(!req.body.newPassword)
    res.status(400).json({status: 400, message: "New password required."})
  const user = await verifyPassword(req, res, {id: res.jwtDecoded.userId})
  await User.update({password: Encryption.encrypt(req.body.newPassword)}, {
    where: {id: user.get().id}
  })
  res.status(200).json({status: 200, message: "Password updated success."})
})

router.postAsync('/reset-password', async (req, res, next) => {
  if(!req.body.email)
    res.status(400).json({status: 400, message: "Email required."})
  const user = await findUser(res, {email: req.body.email})
  const token = jwt.sign({userId: user.get().id})
  const config = {
    from: '"Quasebuda" <noreply.quasebuda@gmail.com>',
    to: req.body.email,
    subject: 'Quasebuda - Redefinir senha',
    text: 'Se você não solicitou esse email, por favor, exclua-o. Copie o link e cole na barra de endereços de seu navegador para redefinir sua senha: http://localhost:8080/redefinir-senha?token=' + token,
    html: '<h1>Quasebuda</h1><h3>Um link para redefinir senha foi solicitado.</h3>Se você não solicitou esse email, por favor, exclua-o. Clique no link para redefinir sua senha: <a href="http://localhost:8080/redefinir-senha?token=' + token + '">http://localhost:8080/redefinir-senha?token='+token+'</a>'
  }
  await sendMail(config)
  res.status(200).json({status: 200, message: "Reset password success."})
})

router.postAsync('/reset-password-update', async (req, res, next) => {
  if(!req.body.newPassword)
    res.status(400).json({status: 400, message: "New password required."})
  if(!req.body.resetPasswordToken)
    res.status(401).json({status: 401, message: "Reset password token required."})
  const jwtResetPasswords = await JwtResetPasswords.findOne({
    where: {jwt: req.body.resetPasswordToken}
  })
  if(!jwtResetPasswords) 
    res.status(401).json({status: 401, message: "Reset password token doesn't exist."})
  await JwtResetPasswords.destroy({where: {jwt: req.body.resetPasswordToken}})
  const decodedToken = jwt.verify(req.body.resetPasswordToken)
  if(!decodedToken)
    res.status(401).json({status: 401, message: "Invalid token."})
  await User.update({password: Encryption.encrypt(req.body.newPassword)}, {
    where: {id: decodedToken.userId}
  })
  res.status(200).json({status: 200, message: "Password updated success."})
})

router.postAsync('/delete', auth, async (req, res, next) => {
  if(!req.body.password)
    res.status(401).json({status: 401, message: "Password required."})
  const user = await verifyPassword(req, res, {id: res.jwtDecoded.userId})
  await JwtUserSessions.destroy({where: {userId: res.jwtDecoded.userId}})
  await JwtResetPasswords.destroy({where: {userId: res.jwtDecoded.userId}})
  await User.destroy({where: {id: res.jwtDecoded.userId}})
  res.status(200).json({status: 200, message: "User deleted success."})
})

async function verifyPassword(req, res, where) {
  if(!req.body.password)
    res.status(401).json({status: 401, message: "Password required."})
  const user = await findUser(res, where)
  if(Encryption.decrypt(user.get().password) !== req.body.password)
    res.status(401).json({status: 401, message: "Incorrect password."})
  return user
}

async function findUser(res, where) {
  const user = await User.findOne({
    where: where
  }).catch(() => res.status(400).json({status: 400, message: "User doesn't exist."}))
  if(!user) 
    res.status(400).json({status: 400, message: "User doesn't exist."})
  return user
}

module.exports = router
