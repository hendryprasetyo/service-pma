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
    CommonHelper.log(['Project Helper', 'Create Project', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })
    if (err.code === 'P2003') {
      return Promise.resolve(Boom.badRequest('Invalid assigneeId'))
    }

    return Promise.reject(err)
  }
}

module.exports = {
  createTask,
}
