const crypto = require('crypto')
const { cdkAccountId, isDevelopment, isStaging, isProduction } = require('../constants')

/**
 * Creates Id that is unique depending on environments, aws accounts and the salt value.
 * The Id can be used for CDK components that need to have globally unique name or id, but must not change when deploying new updates to stacks.
 * @param {object} [options]
 * @param {string} [options.salt]
 * @param {number} [options.length=13]
 * @param {boolean} [options.uniquePerEnvironment=true]
 * @returns {string}
 */
module.exports = function createHashForCdkComponent({ length = 13, uniquePerEnvironment = true, salt }) {
   let stringToBeHashed = cdkAccountId

   if (uniquePerEnvironment) {
      if (isDevelopment) stringToBeHashed += '-dev'
      else if (isStaging) stringToBeHashed += '-stage'
      else if (isProduction) stringToBeHashed += '-prod'
   }

   if (salt) return crypto.createHmac('sha256', salt).update(stringToBeHashed).digest('hex').substr(0, length)
   return crypto.createHash('sha256').update(stringToBeHashed).digest('hex').substr(0, length)
}
