const cdk = require('@aws-cdk/core')
const { Code, LayerVersion, Runtime } = require('@aws-cdk/aws-lambda')
const { BundlingDockerImage, AssetHashType, CfnOutput } = require('@aws-cdk/core')
const { RestApi } = require('@aws-cdk/aws-apigateway')
const { isStaging, isProduction } = require('../../constants')
const setupRoutes = require('./routes/routes')
const HttpMethod = require('../../enums/HttpMethod')


module.exports = class ApiStack extends cdk.Stack {

   /**
    * @param {cdk.App} scope
    * @param {string} id
    * @param {import('../db/DbStack').DBTables} dbTables
    * @param {cdk.StackProps=} props
    */
   constructor(scope, id, dbTables, props) {
      super(scope, id, props)

      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |             NODE MODULES LAMBDA LAYER              |
      \*__________________________________________________*/

      const nodeModulesLambdaLayer = createNodeModulesLambdaLayer(this)


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |                  Create REST API                   |
      \*__________________________________________________*/

      const apiId = 'API'
      const api = new RestApi(this, apiId, {
         restApiName: 'API',
         deployOptions: {
            stageName: (isProduction && 'prod') || (isStaging && 'stage') || 'dev',
         },
         defaultCorsPreflightOptions: {
            allowOrigins: ['*'],
            allowHeaders: ['Authorization', 'X-API-KEY', 'Content-Type'],
            allowMethods: [HttpMethod.DELETE, HttpMethod.GET, HttpMethod.HEAD, HttpMethod.OPTIONS, HttpMethod.PATCH, HttpMethod.POST, HttpMethod.PUT],
         },
      })


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |                 Create Authorizer                  |
      \*__________________________________________________*/

      // TODO: Create authorizer
      /* const authorizerId = `${apiId}_Authorizer`
      const authorizer = new CfnAuthorizer(stack, authorizerId, {
         apiId: api.httpApiId,
         name: authorizerId,
         authorizerType: 'JWT',
         identitySource: ['$request.header.Authorization'], // route.request.header.Auth
         jwtConfiguration: {
            issuer: ``,
            audience: [],
         }
      })

      authorizer.node.addDependency(api) */



      // Output Invoke URL
      new CfnOutput(this, 'API_InvokeURL', {
         value: api.url || '',
      })

      // Routes
      setupRoutes(this, nodeModulesLambdaLayer, api, null, dbTables)
   }

}


/**
 * Returns lambda layer that contains shared node modules between all routes.
 * This function also compiles API code using "yarn build" command, so when routes are being generated,
 * there is everything ready and no more Docker containers are needed to be run.
 * @param {import('@aws-cdk/core').Stack} stack
 * @returns {LayerVersion}
 */
function createNodeModulesLambdaLayer(stack) {
   const nodeModulesLambdaLayer = new LayerVersion(stack, `LambdaLayer_NodeModules`, {
      layerVersionName: 'NodeModules',
      code: Code.fromAsset('../lambda/js', {
         exclude: ['node_modules', 'src', '.gitignore', '.eslintrc.js', 'jsconfig.json', 'README.md', 'dist'],
         assetHashType: AssetHashType.OUTPUT,
         bundling: {
            image: BundlingDockerImage.fromAsset(__dirname),
            command: ['sh', '-c', [
               'cp package.json /asset-output/package.json',
               'cp yarn.lock /asset-output/yarn.lock',
               /*
                * OPTIMIZE: Would copying the node_modules be faster than installing all of the packages from scratch?
                * yarn install would only need to purge devDependencies and not download the packages. There isn't even cache.
                * 'cp -r node_modules /asset-output',
                */
               'cd /asset-output',
               'yarn install --production --frozen-lockfile',
            ].join(' ; ')],
         },
      }),
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      description: 'Contains node-modules for API lambda functions.',
   })
   return nodeModulesLambdaLayer
}