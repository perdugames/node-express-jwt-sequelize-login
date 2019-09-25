import jwt from '../jwt'

module.exports = (req, res, next) => {
  const authorizationHeader = req.headers.authorization
  if(authorizationHeader) {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token)
    if(decodedToken) {
      res.jwtToken = token
      res.jwtDecoded = decodedToken
      next()
    }else{
      res.status(401).json({status: 401, message: "Invalid token."})
    }
  }else{
    res.status(401).json({status: 401, message: "Authorization token required."})
  }
}
