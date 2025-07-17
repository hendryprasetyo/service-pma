const jwt = require('jsonwebtoken')
const generateTokenJWT = (value, tokenSecret, exp) => {
  return jwt.sign(value, tokenSecret, {
    expiresIn: exp,
  })
}
const verifyTokenJWT = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        let customError
        if (err.name === 'TokenExpiredError') {
          customError = new Error('Token has expired')
          customError.statusCode = 400
        } else if (err.name === 'JsonWebTokenError') {
          customError = new Error('Invalid token payload')
          customError.statusCode = 400
        } else {
          customError = new Error('Unexpected error during token verification')
          customError.statusCode = 500
        }
        return reject(customError)
      } else {
        return resolve(decoded)
      }
    })
  })
}

module.exports = {
  generateTokenJWT,
  verifyTokenJWT,
}
