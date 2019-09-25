require("dotenv-json")()
import nodemailer from 'nodemailer'

async function sendMail(config={}) {
  let mailConfig = ""
  if(process.env.NODE_ENV === 'production') {
    mailConfig = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  }else{
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount()
    mailConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass // generated ethereal password
      }
    }
  }
  const transporter = nodemailer.createTransport(mailConfig)
  const info = await transporter.sendMail({
    from: config.from,
    to: config.to,
    subject: config.subject,
    text: config.text,
    html: config.html
  })
  if(process.env.NODE_ENV !== 'production') {
    console.log('Message sent: %s', info.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  }
}

export default sendMail
