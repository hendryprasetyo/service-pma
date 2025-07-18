const Router = require('express').Router()
const Boom = require('boom')
const CommonHelper = require('../common/index')
const projectHelper = require('../helpers/projectHelper')
const AuthGuard = require('../middleware/auth.guard')
const ValidationHelper = require('../helpers/validationHelper')

const getAllProject = async (request, reply) => {
  const { transactionid } = request.headers
  const validate = ValidationHelper.GetProjectsValiation(request.query)
  if (validate) return reply.send(Boom.badRequest(validate))
  try {
    const response = await projectHelper.getAllProject(request)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['Project Controller', 'Get All Project', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

const getProjectDetail = async (request, reply) => {
  const { transactionid } = request.headers
  const validate = ValidationHelper.GetProjectDetailValiation({
    id: request.params?.id,
    status: request.query?.status,
  })
  if (validate) return reply.send(Boom.badRequest(validate))
  try {
    const response = await projectHelper.getProjectDetailById(request)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['Project Controller', 'Get Detail Project', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

const createProject = async (request, reply) => {
  const { transactionid } = request.headers
  const validate = ValidationHelper.CreateProjectValiation(request.body)
  if (validate) return reply.send(Boom.badRequest(validate))
  try {
    const response = await projectHelper.createProject(request)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['Project Controller', 'Create Project', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

const updateProject = async (request, reply) => {
  const { transactionid } = request.headers
  const validate = ValidationHelper.UpdateProjectValiation(request.body)
  if (validate) return reply.send(Boom.badRequest(validate))
  try {
    const response = await projectHelper.updateProject(request)
    return reply.send(response)
  } catch (err) {
    CommonHelper.log(['Project Controller', 'Update Project', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return reply.send(Boom.badImplementation())
  }
}

Router.get('/', AuthGuard, getAllProject)
Router.get('/:id', AuthGuard, getProjectDetail)
Router.post('/', AuthGuard, createProject)
Router.put('/', AuthGuard, updateProject)
module.exports = Router
