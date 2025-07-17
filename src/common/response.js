const geneeralHelper = require('./general')
/*
 *  PRIVATE FUNCTION
 */
const __responseStatusCode = () => {
  return {
    code: '00000',
    message: 'success',
  }
}

/*
 *  PUBLIC FUNCTION
 */

const unifyResponse = async (request, response, body) => {
  const statusCode = body?.output?.statusCode || response.statusCode
  const transactionId = request.headers.transactionid
  let responseCode
  if (body?.isBoom) {
    responseCode = {
      code: body.output.statusCode,
      message: body.output.payload.message,
    }
  } else {
    responseCode = __responseStatusCode()
  }

  const data = body.isBoom ? null : body
  const newResponse = {
    status: responseCode.code,
    message: responseCode.message,
    data: geneeralHelper.isEmpty(data) ? null : data,
    transaction_id: transactionId,
  }

  return Promise.resolve({
    statusCode,
    bodyResponse: newResponse,
  })
}

module.exports = {
  unifyResponse,
}
