const CommonHelper = require('../common/index')
const Boom = require('boom')
const prisma = require('../db/prisma')

/*
 * PUBLIC FUNCTION
 */

const getAllUser = async request => {
  const { transactionid } = request.headers
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
    return users
  } catch (err) {
    CommonHelper.log(['User Helper', 'Get All User', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return Promise.reject(err)
  }
}

const getUserById = async request => {
  const { transactionid } = request.headers
  try {
    const { id } = request.params
    const foundUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
    if (CommonHelper.isEmpty(foundUser))
      return Promise.resolve(Boom.notFound('User notfound'))

    return foundUser
  } catch (err) {
    CommonHelper.log(['User Helper', 'Get User By Id', 'ERROR'], {
      transactionid,
      info: `${err}`,
    })

    return Promise.reject(err)
  }
}

module.exports = {
  getAllUser,
  getUserById,
}
