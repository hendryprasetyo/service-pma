const express = require('express')
const cors = require('cors')
const CommonHelper = require('./common/index')
const Boom = require('boom')
const cookieParser = require('cookie-parser')
const userApi = require('./api/userApi')
const authApi = require('./api/authApi')
const projectApi = require('./api/projectApi')
const taskApi = require('./api/taskApi')
require('dotenv').config()

const PORT = process.env.PORT
const app = express()
const whitelist = ['http://localhost:3000', 'http://127.1.1.0:3000']

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((request, reply, next) => {
  const oldSend = reply.send
  reply.send = async data => {
    reply.send = oldSend // set function back to avoid the 'double-send'
    const response = await CommonHelper.unifyResponse(request, reply, data)
    const logData = CommonHelper.logRequest(request, response)

    CommonHelper.log(['API Request', 'info'], logData)

    return reply.status(response.statusCode).send(response.bodyResponse) // just call as normal with data
  }

  next()
})

app.get('/sys/ping', (request, reply) => {
  request.startTime = process.hrtime()
  reply.send('ok')
})
app.use('/api', userApi)
app.use('/api/projects', projectApi)
app.use('/api/task', taskApi)
app.use('/api/auth', authApi)

app.use((err, req, res, next) => {
  CommonHelper.log(['API Request', 'Invalid input', 'ERROR'], {
    message: err.message || err,
  })

  const logData = CommonHelper.logRequest(req, res)
  CommonHelper.log(['API Request', 'Invalid input', 'info'], logData)

  const payload = Boom.badRequest(err.message || 'Invalid Request').output
    .payload
  res.status(400).json(payload)
})

// Start server
app.listen(PORT, () => {
  CommonHelper.log(['Info'], `Server started on port ${PORT}`)
})
module.exports = app
