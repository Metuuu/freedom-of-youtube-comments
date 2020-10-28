/**
 * Remove object keys with undefined value.
 * Additional clean options can be set via options parameter.
 * The object isn't copied so keys are removed from the original object.
 *
 * @param {Object} obj
 * @param {{
 *    removeNull?: boolean,
 *    removeEmptyString?: boolean,
 *    removeEmptyObject?: boolean,
 * }} [options]
 * @returns {object}
 */
function cleanObject(obj, options) {
   const { removeNull, removeEmptyString, removeEmptyObject } = options || {}
   Object.keys(obj).forEach((key) => {
      if (
         (obj[key] === undefined)
         || (removeNull && obj[key] === null)
         || (removeEmptyString && obj[key] === '')
         || (removeEmptyObject && obj[key] && Object.keys(obj[key]).length === 0 && obj[key].constructor === Object)
      // eslint-disable-next-line no-param-reassign
      ) delete obj[key]
   })
   return obj
}

module.exports = cleanObject
