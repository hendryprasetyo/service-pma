const Router = require('express').Router()
const Boom = require('boom')
const CommonHelper = require('../common/index')
const authHelper = require('../helpers/authHelper')
const ValidationHelper = require('../helpers/validationHelper')

const login = async (request, reply) => {
  const { transactionid } = request.headers
  const validate = ValidationHelper.LoginValiation(request.body)
  if (validate) return reply.send(Boom.badRequest(validate))
  try {
    const response = await authHelper.login(request, reply)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['Auth Controller', 'Login', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

const logout = async (request, reply) => {
  const { transactionid } = request.headers
  try {
    const response = await authHelper.logout(request, reply)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['Auth Controller', 'Logout', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

const register = async (request, reply) => {
  const { transactionid } = request.headers
  const validate = ValidationHelper.RegisterValiation(request.body)
  if (validate) return reply.send(Boom.badRequest(validate))
  try {
    const response = await authHelper.register(request)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['Auth Controller', 'Register', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

Router.post('/login', login)
Router.post('/logout', logout)
Router.post('/register', register)
module.exports = Router
