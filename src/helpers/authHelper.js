const CommonHelper = require('../common/index')
const Bcrypt = require('bcrypt')
const Boom = require('boom')
const prisma = require('../db/prisma')
/*
 * PUBLIC FUNCTION
 */

const login = async (request, reply) => {
  const { transactionid } = request.headers
  try {
    const { password, email } = request.body
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (CommonHelper.isEmpty(user))
      return Promise.resolve(Boom.notFound('User Notfound'))

    const isMatch = await Bcrypt.compare(password, user.password)
    if (!isMatch) {
      return Boom.badRequest('Invalid password')
    }

    const accessToken = CommonHelper.generateTokenJWT(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.EXP_ACCESS_TOKEN
    )

    reply.cookie(process.env.KEY_COOKIE_ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: +process.env.MAX_AGE_COOKIE_AUTH,
      sameSite: process.env.COOKIE_AUTH_SAME_SITE,
      path: '/',
    })
    return { access_token: accessToken }
  } catch (err) {
    CommonHelper.log(['Auth Helper', 'Login', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return Promise.reject(err)
  }
}

const logout = async (request, reply) => {
  const { transactionid } = request.headers
  try {
    const key = process.env.KEY_COOKIE_ACCESS_TOKEN
    const accessToken = request.cookies[key]
    if (!CommonHelper.isEmpty(accessToken)) {
      reply.clearCookie(key, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_AUTH_SAME_SITE,
        path: '/',
      })
    }

    return {}
  } catch (err) {
    CommonHelper.log(['Auth Helper', 'Logout', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return Promise.reject(err)
  }
}

const register = async request => {
  const { transactionid } = request.headers
  try {
    const { password, name, email } = request.body
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (!CommonHelper.isEmpty(user))
      return Promise.resolve(Boom.badRequest('User Already Exist'))

    const hashPassword = await Bcrypt.hash(password, 10)
    await prisma.user.create({ data: { name, email, password: hashPassword } })
    return {}
  } catch (err) {
    CommonHelper.log(['Auth Helper', 'Register', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return Promise.reject(err)
  }
}

module.exports = {
  login,
  logout,
  register,
}
