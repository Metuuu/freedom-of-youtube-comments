const jwt = require('jsonwebtoken')


/**
 * @param {import('aws-lambda').APIGatewayProxyEvent} event Lambda event parameter
 * @returns {string} userId
 */
function parseUserIdFromAuthHeader(event) {
   const authHeader = event.headers.authorization
   const parsedToken = jwt.decode(authHeader)
   return parsedToken.sub
}

/**
 * @param {import('aws-lambda').APIGatewayProxyEvent} event Lambda event parameter
 * @returns {object} data
 */
function parseAuthHeader(event) {
   const authHeader = event.headers.authorization
   const parsedData = jwt.decode(authHeader)
   return parsedData
}


module.exports = {
   parseUserIdFromAuthHeader,
   parseAuthHeader,
}
