require("dotenv-json")()
import crypto from 'crypto'

const cryptoData = {
  algorithm: "aes256",
  secret: process.env.CRYPTOSECRET,
  type: "hex"
}

module.exports = {
  encrypt: (password) => {
    const cipher = crypto.createCipher(cryptoData.algorithm, cryptoData.secret)
    cipher.update(password)
    return cipher.final(cryptoData.type).toString('hex')
  },
  decrypt: (password) => {
    const decipher = crypto.createDecipher(cryptoData.algorithm, cryptoData.secret)
    decipher.update(password, cryptoData.type)
    return decipher.final().toString('hex')
  }
}
