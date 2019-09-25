module.exports = (error, req, res, next) => {
  if(res.headersSent) return next(err)
  if(process.env.NODE_ENV !== 'production')
    console.log(error.message)
  res.status(200).json({status: 200, message: "Something ocurred in Quasebuda servers."})
}
