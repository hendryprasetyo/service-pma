const Pino = require('pino')({
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.LOG_PRETTY_PRINT === 'true' || false,
  base: null,
  formatters: {
    level: label => ({ level: label }),
  },
  enabled: process.env.NODE_ENV !== 'test',
  redact:
    process.env.LOG_REDUCTION_KEYS &&
    JSON.parse(process.env.LOG_REDUCTION_KEYS), // format ['data.*.key', 'path.to.key', 'arrays[*].key']
})

const log = (tags, data) => {
  const logs = { tags }
  if (data) {
    Object.assign(logs, { data })
  }

  Pino.info(logs)
}

const logRequest = (req, res) => {
  const timeDiff = process.hrtime(req.startTime)
  const timeTaken = Math.round((timeDiff[0] * 1e9 + timeDiff[1]) / 1e6)

  const logData = {
    transactionid: req.headers.transactionid,
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode,
    timeTaken,
    ip: req?.headers['x-forwarded-for'],
    endpoint: req?.headers?.endpoint,
  }

  return logData
}
module.exports = {
  log,
  logRequest,
}
