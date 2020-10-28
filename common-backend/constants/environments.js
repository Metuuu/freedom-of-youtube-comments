const isDevelopment = (process.env.IS_DEVELOPMENT === 'true')
const isStaging = (process.env.IS_STAGING === 'true')
const isProduction = (process.env.IS_PRODUCTION === 'true')

module.exports = {
   isDevelopment,
   isStaging,
   isProduction,
}
