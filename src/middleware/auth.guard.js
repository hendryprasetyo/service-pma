const Boom = require('boom')
const CommonHelper = require('../common/index')
const prisma = require('../db/prisma')
require('dotenv').config()

const AuthGuard = async (request, reply, next) => {
  try {
    const authHeader =
      request.headers.authorization || request.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
      CommonHelper.log(['Middleware', 'AuthGuard', 'ERROR'], {
        message: 'Bearer is missing',
        transactionid: request.headers.transactionid,
      })
      return reply.send(Boom.unauthorized())
    }

    const token = authHeader.split(' ')[1]

    if (
      !token ||
      token.toLowerCase() === 'null' ||
      token.toLowerCase() === 'undefined'
    ) {
      CommonHelper.log(['Middleware', 'AuthGuard', 'ERROR'], {
        message: 'Token is missing',
        transactionid: request.headers.transactionid,
      })
      return reply.send(Boom.unauthorized())
    }
    const verifyToken = await CommonHelper.verifyTokenJWT(
      token,
      process.env.ACCESS_TOKEN_SECRET
    )

    const user = await prisma.user.findUnique({
      where: { id: verifyToken?.id },
    })
    if (CommonHelper.isEmpty(user)) return reply.send(Boom.unauthorized())

    request.auth = verifyToken
    return next()
  } catch (error) {
    CommonHelper.log(['Middleware', 'AuthGuard', 'ERROR'], {
      message: `${error}`,
      transactionid: request.headers.transactionid,
    })
    if (error?.statusCode === 400) return reply.send(Boom.forbidden())

    return reply.send(Boom.badImplementation())
  }
}

module.exports = AuthGuard
