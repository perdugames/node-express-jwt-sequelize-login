require("dotenv-json")()
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import user from './routes/user-routes'
import errorHandler from './middlewares/error-handler'

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use('/user', user)
app.use(errorHandler) // It's important to be after all routes is add

app.get('/', function(req, res) {
  res.send(JSON.stringify({status: 200, msg: "Quasebuda API."}))
})

const corsOptions = {
  origin: 'http://localhost:8080',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.listen(8000, function() {
  console.log('Server started on port 8000.')
})

export default app
