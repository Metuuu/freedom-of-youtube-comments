const { Runtime, Function } = require('@aws-cdk/aws-lambda')
const { Duration } = require('@aws-cdk/core')
const { isDevelopment, isStaging, isProduction } = require('../../constants')


/**
 * @typedef LambdaFunctionProperties
 * @property {Runtime} [runtime] Default: `Runtime.NODEJS_12_X`
 * @property {number} [memorySize] Default: `128`
 * @property {number} [timeout] In seconds. Default: `10`
 */
/**
 * @typedef LambdaAccessProperties
 *
 * { db: { write: [dbTables.test], read: [dbTables.test] } },
 * @property {Object} [db]
 * @property {import('../db/DbStack').Table[]} [db.read] Grand read access for Lambda func to tables
 * @property {import('../db/DbStack').Table[]} [db.write] Grand write access for Lambda func to tables
 * @property {import('../db/DbStack').Table[]} [db.readWrite] Grand read and write access for Lambda func to tables
 */


module.exports = class LambdaGenerator {

   /**
    * @param {import('@aws-cdk/core').Stack} stack
    * @param {import('@aws-cdk/aws-lambda').LayerVersion} [sharedNodeModulesLayer]
    */
   constructor(stack, sharedNodeModulesLayer) {
      this.stack = stack
      this.sharedNodeModulesLayer = sharedNodeModulesLayer
   }

   /**
    * @param {string} id
    * @param {object} props
    * @param {string} props.name
    * @param {string} props.handler
    * @param {import('@aws-cdk/aws-lambda').Code} props.code
    * @param {import('@aws-cdk/aws-lambda').ILayerVersion[]} [props.layers]
    * @param {LambdaAccessProperties} [props.access]
    * @param {LambdaFunctionProperties} [props.lambda]
    * @param {Object<string, string>} [props.env]
    * @returns {import('@aws-cdk/aws-lambda').Function}
    */
   createFunction(id, props) {
      const { name, handler, code, layers = [], access = {}, lambda = {}, env = {} } = props || {}
      const dbAccess = access.db || {}


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |      Environment variables for Lambda function     |
      \*__________________________________________________*/

      /** @type {{ [key: string]: string }} */
      const environment = {
         NODE_PATH: '/opt/node_modules',
         ...env,
      }

      // Environment
      if (isDevelopment) environment.IS_DEVELOPMENT = 'true'
      else if (isStaging) environment.IS_STAGING = 'true'
      else if (isProduction) environment.IS_PRODUCTION = 'true'

      // Table names that the function has read or write access to
      const tables = [...(dbAccess.read || []), ...(dbAccess.write || []), ...(dbAccess.readWrite || [])]
      tables.forEach((t) => { environment[t.tableNameKey] = t.table.tableName })


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |             Create the Lambda function             |
      \*__________________________________________________*/

      const timeout = Duration.seconds(lambda.timeout || 10)
      const runtime = lambda.runtime || Runtime.NODEJS_12_X

      const lambdaLayers = [...layers]
      if (this.sharedNodeModulesLayer) lambdaLayers.push(this.sharedNodeModulesLayer)

      const handlerFunc = new Function(this.stack, id, {
         functionName: name,
         memorySize: lambda.memorySize,
         code,
         handler,
         environment,
         runtime,
         timeout,
         layers: lambdaLayers,
      })
      layers.forEach((layer) => handlerFunc.node.addDependency(layer))


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |     Grant Lambda access to other AWS services      |
      \*__________________________________________________*/

      // DB Access
      const { read: dbRead = [], write: dbWrite = [], readWrite: dbReadWrite = [] } = dbAccess
      dbRead.forEach((a) => a.table.grantReadData(handlerFunc))
      dbWrite.forEach((a) => a.table.grantWriteData(handlerFunc))
      dbReadWrite.forEach((a) => a.table.grantReadWriteData(handlerFunc))



      return handlerFunc
   }

}
