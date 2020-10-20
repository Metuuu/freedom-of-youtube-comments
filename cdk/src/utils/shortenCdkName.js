const createHashForCdkComponent = require('./createHashForCdkComponent')

/**
 * Creates shortened name that is unique between aws accounts.
 * This can be used for shortening too long Lambda Function names for example.
 * Prefix and suffix will not be modified.
 * @param {string} name
 * @param {object} [options]
 * @param {string} [options.prefix]
 * @param {string} [options.suffix]
 * @param {number} [options.maxLength] Default: 64
 * @param {number} [options.hashLength] Default: 5
 * @returns {string}
 */
module.exports = function shortenCdkName(name, options = {}) {
   const { prefix, suffix, maxLength = 64, hashLength = 5 } = options
   const lettersToBeSubstringed = ((prefix || '').length + name.length + (suffix || '').length + hashLength) - maxLength
   if (lettersToBeSubstringed <= hashLength) return `${prefix || ''}${name}${suffix || ''}`

   const from = Math.floor((name.length / 2 - lettersToBeSubstringed / 2))
   const to = from + Math.floor(lettersToBeSubstringed)
   const salt = name.substr(from, Math.floor(lettersToBeSubstringed))

   const hash = createHashForCdkComponent({ length: hashLength, uniquePerEnvironment: false, salt })

   let shortenedName = ''
   if (prefix) shortenedName += prefix
   shortenedName += name.substr(0, from) + hash + name.substr(to, name.length)
   if (suffix) shortenedName += suffix

   return shortenedName
}
