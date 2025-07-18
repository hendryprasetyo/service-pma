const Router = require('express').Router()
const Boom = require('boom')
const CommonHelper = require('../common/index')
const taskHelper = require('../helpers/taskHelper')
const AuthGuard = require('../middleware/auth.guard')
const ValidationHelper = require('../helpers/validationHelper')

const createTask = async (request, reply) => {
  const { transactionid } = request.headers
  const validate = ValidationHelper.CreateTaskValiation(request.body)
  if (validate) return reply.send(Boom.badRequest(validate))
  try {
    const response = await taskHelper.createTask(request)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['Task Controller', 'Create Task', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

const updateTask = async (request, reply) => {
  const { transactionid } = request.headers
  const validate = ValidationHelper.UpdateTaskValiation(request.body)
  if (validate) return reply.send(Boom.badRequest(validate))
  try {
    const response = await taskHelper.updateTask(request)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['Task Controller', 'Update Task', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

Router.post('/', AuthGuard, createTask)
Router.patch('/', AuthGuard, updateTask)
module.exports = Router
