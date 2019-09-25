import faker from 'faker'
import models from 'app/models'
import uuid from 'uuid/v4'
import Encryption from 'app/encryption.js'

const data = async (props = {}) => {
  const defaultProps = {
    id: uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: Encryption.encrypt(faker.internet.password())
  }
  return Object.assign({}, defaultProps, props)
}

module.exports = async (props = {}) => models.User.create(await data(props))
