const Router = require('express').Router()
const Boom = require('boom')
const CommonHelper = require('../common/index')
const userHelper = require('../helpers/userHelper')
const AuthGuard = require('../middleware/auth.guard')

const getAllUser = async (request, reply) => {
  const { transactionid } = request.headers
  try {
    const response = await userHelper.getAllUser(request)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['User Controller', 'Get All User', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

const getUserById = async (request, reply) => {
  const { transactionid } = request.headers
  try {
    const response = await userHelper.getUserById(request)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['User Controller', 'Get All User', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

Router.get('/users', AuthGuard, getAllUser)
Router.get('/users/:id', AuthGuard, getUserById)
module.exports = Router
