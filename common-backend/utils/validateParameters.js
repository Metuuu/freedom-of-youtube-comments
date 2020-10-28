const { ExcAPIInvalidParameters } = require('../models/exceptions')

/**
 * @param {import('@hapi/joi').Schema} validationSchema
 * @param {any} parameters
 * @returns {Promise<any>} Validated parameters
 * @throws {ExcAPIInvalidParameters}
 */
module.exports = async function validateParameters(validationSchema, parameters) {
   try {
      return await validationSchema.validateAsync(parameters)
   } catch(err) {
      throw new ExcAPIInvalidParameters(err.message)
   }
}
