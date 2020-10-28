const Responses = require('@foyc/common-backend/models/Responses')
const { ExcAPIInvalidParameters } = require('@foyc/common-backend/models/exceptions')
const { isProduction } = require('@foyc/common-backend/constants')
const qs = require('qs')

const appPath = `./api/${process.env.API_PATH}`
const appFile = process.env.API_METHOD.toLowerCase()

/**
 * @typedef {object} ApiFunctionProps
 * @property {import('aws-lambda').APIGatewayProxyEvent} event
 * @property {any} body
 * @property {any} queryStringParameters
 * @property {any} pathParameters
 */

/**
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>}
 */
exports.handler = async (event) => {
   try {
      // Load app function
      const app = await requireFile(`${appPath}/${appFile}`, true)

      // Setup Parameters
      let body = event.body
      if (typeof event.body === 'string') {
         try { body = JSON.parse(body) }
         catch(err) { return Responses.BAD_REQUEST('Invalid JSON data in body') }
      }
      const pathParameters = event.pathParameters || {}

      // Handle query string parameters
      // @ts-ignore
      const queryStringParameters = qs.parse(event.queryStringParameters || '') // Parsing works for objects
      // @ts-ignore
      const multiValueQueryStringParameters = qs.parse(event.multiValueQueryStringParameters || '')
      for (const key in multiValueQueryStringParameters) {
         if ((queryStringParameters[key] instanceof Array) || multiValueQueryStringParameters[key].length > 1) queryStringParameters[key] = multiValueQueryStringParameters[key]
      }

      // Main
      const response = await app({ event, body, queryStringParameters, pathParameters })

      if (response.statusCode === undefined || response.headers === undefined) {
         return Responses.INTERNAL_SERVER_ERROR(`API didn't return response. You should return: "Responses.<STATUS>(...)"`)
      }

      return response

   } catch(err) {
      return errorToResponse(err)
   }
}


/**
 * @param {Error} err
 * @returns {import('aws-lambda').APIGatewayProxyResult}
 */
function errorToResponse(err) {
   if (err instanceof ExcAPIInvalidParameters) {
      return Responses.BAD_REQUEST(err.message)
   }
   console.error(err.stack)
   if (!isProduction) return Responses.INTERNAL_SERVER_ERROR(err.stack)
   return Responses.INTERNAL_SERVER_ERROR()
}

/**
 * @param {string} path
 * @param {boolean} throwOnNoFile
 * @returns {Function}
 */
function requireFile(path, throwOnNoFile) {
   // eslint-disable-next-line global-require, import/no-dynamic-require
   try { return require(path) } catch(err) {
      const moduleExists = !(err.code === 'MODULE_NOT_FOUND' && err.message.match(new RegExp(`Cannot find module '${path}'`, 'g')))
      if (moduleExists) throw new Error(err.stack)
      else if (throwOnNoFile) throw err
   }
}
