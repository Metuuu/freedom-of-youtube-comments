const Responses = require('@foyc/common-backend/models/Responses')

/** @returns {Promise<import('aws-lambda').ProxyResult>} */
module.exports = async function getTest() {
   const causeError = () => {
      throw new Error('Error')
   }
   causeError()
   return Responses.SUCCESS('OK')
}
