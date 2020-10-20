/**
 * @typedef ResponseOptions
 * @prop {object} [headers]
 * @prop {boolean} [isBase64Encoded]
 */
/**
 * @type {{
 *   SUCCESS: (data: any, options?: ResponseOptions) => import('aws-lambda').ProxyResult,
 *   CREATED: (data: any, options?: ResponseOptions) => import('aws-lambda').ProxyResult,
 *   NO_CONTENT: (options?: ResponseOptions) => object,
 *   BAD_REQUEST: (message?: string, options?: ResponseOptions) => import('aws-lambda').ProxyResult,
 *   UNAUTHORIZED: (message?: string, options?: ResponseOptions) => import('aws-lambda').ProxyResult,
 *   FORBIDDEN: (message?: string, options?: ResponseOptions) => import('aws-lambda').ProxyResult,
 *   NOT_FOUND: (message?: string, options?: ResponseOptions) => import('aws-lambda').ProxyResult,
 *   CONFLICT: (message?: string, options?: ResponseOptions) => import('aws-lambda').ProxyResult,
 *   INTERNAL_SERVER_ERROR: (error?: object, options?: ResponseOptions) => import('aws-lambda').ProxyResult,
 * }}
 */
const Responses = {
   SUCCESS: (data, options) => throwResponse(200, data, undefined, options),
   CREATED: (data, options) => throwResponse(201, data, undefined, options),
   NO_CONTENT: (options) => throwResponse(204, undefined, undefined, options),
   BAD_REQUEST: (message, options) => throwResponse(400, message, 'Bad Request', options),
   UNAUTHORIZED: (message, options) => throwResponse(401, message, 'Unauthorized', options),
   FORBIDDEN: (message, options) => throwResponse(403, message, 'Forbidden', options),
   NOT_FOUND: (message, options) => throwResponse(404, message, 'Not Found', options),
   CONFLICT: (message, options) => throwResponse(409, message, 'Conflict', options),
   INTERNAL_SERVER_ERROR: (error, options) => throwResponse(500, error, 'Internal Server Error', options),
}

/**
 * @param {number} statusCode
 * @param {(string|object)?} dataOrMessage
 * @param {string} errorMessage
 * @param {ResponseOptions} options
 * @returns {import('aws-lambda').ProxyResult} Api response
 */
function throwResponse(statusCode, dataOrMessage, errorMessage, options = {}) {
   console.log(`Request completed with status code of ${statusCode}`)
   /** @type {import('aws-lambda').APIGatewayProxyResult} */
   const response = {
      body: '',
      isBase64Encoded: !!options.isBase64Encoded,
      statusCode,
      headers: {
         'Access-Control-Allow-Origin': '*',
      },
   }
   if (!errorMessage) {
      if (dataOrMessage !== undefined) {
         response.headers['Content-Type'] = (typeof dataOrMessage === 'object')
            ? 'application/json'
            : 'text/plain'
      }
      response.body = (typeof dataOrMessage === 'object')
         ? JSON.stringify(dataOrMessage)
         : dataOrMessage
   } else {
      const responseBody = { error: { code: statusCode, message: errorMessage } }
      if (dataOrMessage) responseBody.error.details = dataOrMessage
      response.headers['Content-Type'] = 'application/json'
      response.body = JSON.stringify(responseBody)
   }

   response.headers = { ...response.headers, ...options.headers }

   return response
}

module.exports = Responses
