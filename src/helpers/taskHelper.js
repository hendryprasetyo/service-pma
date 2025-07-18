const CommonHelper = require('../common/index')
const Boom = require('boom')
const prisma = require('../db/prisma')

/*
 * PUBLIC FUNCTION
 */

const createTask = async request => {
  const { transactionid } = request.headers
  try {
    const { projectId, tasks = [] } = request.body
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
      },
    })

    if (CommonHelper.isEmpty(project))
      return Promise.resolve(Boom.notFound('Project Notfound'))

    const tasksToCreate = tasks.map(task => ({
      title: task.title,
      description: task.description,
      status: task.status,
      projectId,
      assigneeId: task.assigneeId,
    }))

    await prisma.task.createMany({
      data: tasksToCreate,
      skipDuplicates: true,
    })

    return {}
  } catch (err) {
    CommonHelper.log(['Task Helper', 'Create Task', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })
    if (err.code === 'P2003') {
      return Promise.resolve(Boom.badRequest('Invalid assigneeId'))
    }

    return Promise.reject(err)
  }
}

const updateTask = async request => {
  const { transactionid } = request.headers
  try {
    const userId = request.auth?.id
    const { projectId, taskId, status } = request.body
    const [existingTask, isMember] = await Promise.all([
      prisma.task.findFirst({
        where: { id: taskId, projectId },
      }),
      prisma.membership.findFirst({
        where: {
          userId,
          projectId,
        },
      }),
    ])
    if (!isMember) {
      return Promise.resolve(
        Boom.badRequest('You are not a member of this project')
      )
    }
    if (!existingTask) {
      return Promise.resolve(Boom.notFound('Task not found'))
    }
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
      },
    })
    return updatedTask
  } catch (err) {
    CommonHelper.log(['Task Helper', 'Update Task', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return Promise.reject(err)
  }
}

module.exports = {
  createTask,
  updateTask,
}
