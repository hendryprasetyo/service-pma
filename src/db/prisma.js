const { PrismaClient } = require('@prisma/client')
const CommonHelper = require('../common/index')
const globalForPrisma = global

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  })

// Logging query + response time
prisma.$on('query', e => {
  CommonHelper.log(['Prisma', 'Query'], {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
  })
})

prisma.$on('error', e => {
  CommonHelper.log(['Prisma', 'Error'], {
    info: `${e.message}`,
  })
})

prisma.$on('warn', e => {
  CommonHelper.log(['Prisma', 'Warn'], {
    info: e.message,
  })
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

module.exports = prisma
