import chai from "chai"
import chaiHttp from "chai-http"
import app from "../app/index"
import truncate from "./truncate"
import {userFake, userSessionFake, userResetPasswordFake} from "./helpers"
import Encryption from "../app/encryption.js"
import jwt from '../app/jwt'

const should = chai.should()
const expect = chai.expect
chai.use(chaiHttp);

describe("API Test", () => {
  let user
  let userSessionOne
  let userSessionTwo
  let userResetPasswordOne
  let userResetPasswordInvalid
  
  beforeEach(async () => {
    await truncate()
    user = await userFake()
    userSessionOne = await userSessionFake(user.dataValues.id)
    userSessionTwo = await userSessionFake(user.dataValues.id)
    userResetPasswordOne = await userResetPasswordFake(user.dataValues.id)
    userResetPasswordInvalid = await userResetPasswordFake(user.dataValues.id, true)
  })
  
  
  it("/user/signup Required fields were not sent", (done) => {
    chai.request(app)
    .post("/user/signup")
    .type("json")
    .send({username: "userTest", password: "123"})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Required fields were not sent.")
      expect(res).to.have.status(400)
      done()
    })
  })
  
  it("/user/signup User already exists", (done) => {
    chai.request(app)
    .post("/user/signup")
    .type("json")
    .send({username: "userTest", password: "123", email: user.dataValues.email})
    .end(function(err, res) {
      expect(res.body.message).to.equal("User already exists.")
      expect(res).to.have.status(400)
      done()
    })
  })
  
  it("/user/signup success", (done) => {
    chai.request(app)
    .post("/user/signup")
    .type("json")
    .send({username: "userTest", password: "123", email: "usertest@email"})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Signup success.")
      expect(res).to.have.status(200)
      done()
    })
  })
  
  it("/user/signin Email required", (done) => {
    chai.request(app)
    .post("/user/signin")
    .type("json")
    .send({password: Encryption.decrypt(user.dataValues.password)})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Email required.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/signin Password required", (done) => {
    chai.request(app)
    .post("/user/signin")
    .type("json")
    .send({email: user.dataValues.email})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Password required.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/signin User doesn't exist", (done) => {
    chai.request(app)
    .post("/user/signin")
    .type("json")
    .send({password: Encryption.decrypt(user.dataValues.password), email: "bug@mail.com"})
    .end(function(err, res) {
      expect(res.body.message).to.equal("User doesn't exist.")
      expect(res).to.have.status(400)
      done()
    })
  })
  
  it("/user/signin Incorrect password", (done) => {
    chai.request(app)
    .post("/user/signin")
    .type("json")
    .send({password: "BUG", email: user.dataValues.email})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Incorrect password.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/signin success", (done) => {
    chai.request(app)
    .post("/user/signin")
    .type("json")
    .send({password: Encryption.decrypt(user.dataValues.password), email: user.dataValues.email})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Signin success.")
      expect(res).to.have.status(200)
      expect(jwt.decode(res.body.data.jwt).payload.userId).to.equal(user.dataValues.id)
      done()
    })
  })
  
  it("/user/logout Authorization token required", (done) => {
    chai.request(app)
    .post("/user/logout")
    .type("json")
    .send({logoutAll: false})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Authorization token required.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/logout Invalid token", (done) => {
    chai.request(app)
    .post("/user/logout")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt + "BUG")
    .send({logoutAll: false})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Invalid token.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/logout all success", (done) => {
    chai.request(app)
    .post("/user/logout")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt)
    .send({logoutAll: true})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Logout success.")
      expect(res).to.have.status(200)
      done()
    })
  })
  
  it("/user/logout success", (done) => {
    chai.request(app)
    .post("/user/logout")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt)
    .send({logoutAll: false})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Logout success.")
      expect(res).to.have.status(200)
      done()
    })
  })
  
  it("/user/update-password New password required", (done) => {
    chai.request(app)
    .put("/user/update-password")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt)
    .send({password: Encryption.decrypt(user.dataValues.password)})
    .end(function(err, res) {
      expect(res.body.message).to.equal("New password required.")
      expect(res).to.have.status(400)
      done()
    })
  })
  
  it("/user/update-password Password required", (done) => {
    chai.request(app)
    .put("/user/update-password")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt)
    .send({
      newPassword: "newPassword123"
    })
    .end(function(err, res) {
      expect(res.body.message).to.equal("Password required.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/update-password Incorrect password", (done) => {
    chai.request(app)
    .put("/user/update-password")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt)
    .send({
      password: "BUG",
      newPassword: "newPassword123"
    })
    .end(function(err, res) {
      expect(res.body.message).to.equal("Incorrect password.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/update-password success", (done) => {
    chai.request(app)
    .put("/user/update-password")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt)
    .send({
      password: Encryption.decrypt(user.dataValues.password),
      newPassword: "newPassword123"
    })
    .end(function(err, res) {
      expect(res.body.message).to.equal("Password updated success.")
      expect(res).to.have.status(200)
      done()
    })
  })
  
  it("/user/reset-password Email required", function(done) {
    this.timeout(30000)
    chai.request(app)
    .post("/user/reset-password")
    .type("json")
    .end(function(err, res) {
      expect(res.body.message).to.equal("Email required.")
      expect(res).to.have.status(400)
      done()
    })
  })
  
  it("/user/reset-password success", function(done) {
    this.timeout(30000)
    chai.request(app)
    .post("/user/reset-password")
    .type("json")
    .send({email: user.dataValues.email})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Reset password success.")
      expect(res).to.have.status(200)
      done()
    })
  })
  
  it("/user/reset-password-update New password required", function(done) {
    chai.request(app)
    .put("/user/reset-password-update")
    .type("json")
    .send({resetPasswordToken: userResetPasswordOne.dataValues.jwt})
    .end(function(err, res) {
      expect(res.body.message).to.equal("New password required.")
      expect(res).to.have.status(400)
      done()
    })
  })
  
  it("/user/reset-password-update Reset password token required", function(done) {
    chai.request(app)
    .put("/user/reset-password-update")
    .type("json")
    .send({newPassword: "newPassword123"})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Reset password token required.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/reset-password-update Reset password token doesn't exist", function(done) {
    chai.request(app)
    .put("/user/reset-password-update")
    .type("json")
    .send({newPassword: "newPassword123", resetPasswordToken: userResetPasswordOne.dataValues.jwt + "BUG"})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Reset password token doesn't exist.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/reset-password-update Invalid token", function(done) {
    chai.request(app)
    .put("/user/reset-password-update")
    .type("json")
    .send({newPassword: "newPassword123", resetPasswordToken: userResetPasswordInvalid.dataValues.jwt})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Invalid token.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/reset-password-update success", function(done) {
    chai.request(app)
    .put("/user/reset-password-update")
    .type("json")
    .send({newPassword: "newPassword123", resetPasswordToken: userResetPasswordOne.dataValues.jwt})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Password updated success.")
      expect(res).to.have.status(200)
      done()
    })
  })
  
  it("/user/delete Password required", function(done) {
    chai.request(app)
    .delete("/user/delete")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt)
    .end(function(err, res) {
      expect(res.body.message).to.equal("Password required.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/delete Authorization token required", function(done) {
    chai.request(app)
    .delete("/user/delete")
    .type("json")
    .send({password: Encryption.decrypt(user.dataValues.password)})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Authorization token required.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/delete Invalid token", function(done) {
    chai.request(app)
    .delete("/user/delete")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt + "BUG")
    .send({password: Encryption.decrypt(user.dataValues.password)})
    .end(function(err, res) {
      expect(res.body.message).to.equal("Invalid token.")
      expect(res).to.have.status(401)
      done()
    })
  })
  
  it("/user/delete success", function(done) {
    chai.request(app)
    .delete("/user/delete")
    .type("json")
    .set("authorization", "Bearer " + userSessionOne.dataValues.jwt)
    .send({password: Encryption.decrypt(user.dataValues.password)})
    .end(function(err, res) {
      expect(res.body.message).to.equal("User deleted success.")
      expect(res).to.have.status(200)
      done()
    })
  })
  
})
