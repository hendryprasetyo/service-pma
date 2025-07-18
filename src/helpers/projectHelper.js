const CommonHelper = require('../common/index')
const Boom = require('boom')
const prisma = require('../db/prisma')

/*
 * PUBLIC FUNCTION
 */

const getAllProject = async request => {
  const { transactionid } = request.headers
  try {
    const {
      search = '', // default: no filter by name
      limit = 10, // default: 10 items per page
      page = 1, // default: first page
      orderBy = 'createdAt', // default order field
      order = 'desc', // default order direction
    } = request.query
    const userId = request.auth.id
    const take = Number(limit)
    const skip = (Number(page) - 1) * take
    const projects = await prisma.project.findMany({
      where: {
        ownerId: userId,
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        [orderBy]: order.toLowerCase() === 'asc' ? 'asc' : 'desc',
      },
      skip,
      take,
    })

    return projects
  } catch (err) {
    CommonHelper.log(['Project Helper', 'Get All Project', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return Promise.reject(err)
  }
}

const getProjectDetailById = async request => {
  const { transactionid } = request.headers
  try {
    const userId = request.auth?.id
    const { id } = request.params
    const { status } = request.query

    const isMember = await prisma.membership.findFirst({
      where: {
        userId,
        projectId: id,
      },
    })

    if (!isMember) {
      return Promise.resolve(
        Boom.badRequest('You are not authorized to access this project')
      )
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        tasks: {
          where: status ? { status } : undefined,
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        memberships: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (CommonHelper.isEmpty(project))
      return Promise.resolve(Boom.notFound('Project notfound'))

    const membershipsWithFlag = project.memberships.map(m => ({
      ...m.user,
      isOwner: m.user.id === userId,
    }))

    return {
      ...project,
      memberships: membershipsWithFlag,
    }
  } catch (err) {
    CommonHelper.log(['Project Helper', 'Get Project By Id', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return Promise.reject(err)
  }
}

const createProject = async request => {
  const { transactionid } = request.headers
  try {
    const userId = request.auth?.id
    const { title, tasks = [] } = request.body

    // Buat Project baru
    const newProject = await prisma.project.create({
      data: {
        name: title,
        owner: {
          connect: { id: userId },
        },
        memberships: {
          create: {
            user: {
              connect: { id: userId },
            },
          },
        },
        tasks: {
          create: tasks.map(task => ({
            title: task.title,
            description: task.description,
            status: task.status,
            assignee: task.assigneeId
              ? { connect: { id: task.assigneeId } }
              : undefined,
          })),
        },
      },
      include: {
        tasks: true,
        memberships: true,
      },
    })

    return newProject
  } catch (err) {
    CommonHelper.log(['Project Helper', 'Create Project', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return Promise.reject(err)
  }
}

const updateProject = async request => {
  const { transactionid } = request.headers
  try {
    const userId = request.auth?.id
    const { projectId, title, newMembers = [] } = request.body

    // 1. Cek apakah user adalah owner project
    const project = await prisma.project.findUnique({
      where: { id: projectId, ownerId: userId },
      include: { memberships: true },
    })

    if (!project) return Promise.resolve(Boom.notFound('Project not found'))

    await prisma.$transaction(async tx => {
      // 3. Update nama project kalau ada
      if (!CommonHelper.isEmpty(title)) {
        await tx.project.update({
          where: { id: projectId },
          data: { name: title },
        })
      }

      // 4. Tambahkan member baru
      if (newMembers.length > 0) {
        // ambil id user yang sudah jadi member
        const existingMemberIds = project.memberships.map(m => m.userId)
        const toAdd = newMembers.filter(id => !existingMemberIds.includes(id))

        // insert baru jika ada
        if (toAdd.length > 0) {
          await tx.membership.createMany({
            data: toAdd.map(userId => ({
              userId,
              projectId,
            })),
            skipDuplicates: true,
          })
        }
      }
    })

    return { success: true }
  } catch (err) {
    CommonHelper.log(['Project Helper', 'Update Project', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })
    return Promise.reject(err)
  }
}

module.exports = {
  getAllProject,
  getProjectDetailById,
  createProject,
  updateProject,
}
