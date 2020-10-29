const Responses = require('@foyc/common-backend/models/Responses')

/** @returns {Promise<import('aws-lambda').ProxyResult>} */
module.exports = async function getTest() {
   return Responses.SUCCESS('OK')
}
