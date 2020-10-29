const { AssetHashType, BundlingDockerImage } = require('@aws-cdk/core')
const { Runtime, RuntimeFamily, Code } = require('@aws-cdk/aws-lambda')
const { LambdaIntegration } = require('@aws-cdk/aws-apigateway')
const { ServicePrincipal } = require('@aws-cdk/aws-iam')
const LambdaGenerator = require('../LambdaGenerator')

// This variable is used for determining if api code has to be built before building it with @vercel/ncc to a single file
let hasApiCodeBeenBuilt = false


module.exports = class EndpointsGenerator extends LambdaGenerator {

   /**
    * @param {import('@aws-cdk/core').Stack} stack
    * @param {import('@aws-cdk/aws-apigateway').RestApi} api
    * @param {import('@aws-cdk/aws-lambda').LayerVersion} [sharedNodeModulesLayer]
    */
   constructor(stack, api, sharedNodeModulesLayer) {
      super(stack, sharedNodeModulesLayer)
      /** @type {{ path: Path, resource: import('@aws-cdk/aws-apigateway').Resource }[]} */
      this.existingResources = []
      this.api = api
      /** If shared node_modules are not used, optimize the code using @vercel/ncc */
      this.optimizeBuildToSingleFile = !this.sharedNodeModulesLayer
   }

   /**
    * @typedef {string} Path
    * Endpoint for the API method.
    * Path params are created by wrapping the param part of the path with curly braces.
    */

   /**
    * @param {import('../../../enums/HttpMethod')} method
    * @param {Path} path
    * @param {object} [props]
    * @param {import('@aws-cdk/aws-apigateway').CfnAuthorizer} [props.authorizer]
    * @param {boolean} [props.isApiKeyRequired]
    * @param {import('../LambdaGenerator').LambdaAccessProperties} [props.access]
    * @param {import('../LambdaGenerator').LambdaFunctionProperties} [props.lambda]
    * @param {Object<string, string>} [props.env]
    */
   addEndpoint(method, path, props) {
      const { isApiKeyRequired, authorizer, access = {}, lambda = {}, env = {} } = props || {}

      const endpointPathStringForId = (`${path.replace(/^\//, '').replace(/\//g, '_')}_${method}`).replace(/\{/g, '-').replace(/\}/g, '-')
      const endpointId = `API_Endpoint__${endpointPathStringForId}`
      const lambdaFunctionId = `API_LambdaFunc__${endpointPathStringForId}`


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |      Environment variables for Lambda function     |
      \*__________________________________________________*/

      /** @type {{ [key: string]: string }} */
      const environment = {
         API_PATH: path,
         API_METHOD: method,
         ...env,
      }


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |             Create the Lambda function             |
      \*__________________________________________________*/

      const runtime = lambda.runtime || Runtime.NODEJS_12_X
      let code

      if (this.optimizeBuildToSingleFile) {
         code = Code.fromAsset('../', {
            assetHashType: AssetHashType.OUTPUT,
            bundling: {
               image: BundlingDockerImage.fromAsset(__dirname),
               volumes: [
                  { hostPath: '/tmp', containerPath: '/tmp' },
                  { hostPath: '/tmp', containerPath: '/.cache' },
               ],
               command: ['sh', '-c', [
                  'cd api',

                  // Build (skip the build process if already been built)
                  ...(!hasApiCodeBeenBuilt ? [
                     'echo -e "\\e[92mBuilding \\e[96mAPI code\\e[39m"',
                     'rm -r build',
                     'yarn install --production --frozen-lockfile --modules-folder ./build/node_modules', // Build production node_modules to build folder
                     'cp -r src/* build', // Copy src folder to build folder
                  ] : []),

                  `echo -e "\\e[92mBuilding \\e[96m${method} ${path}\\e[39m"`,
                  'cd build',
                  `exportCode="module.exports = require('.${path}/${method.toLowerCase()}')"
                  echo "$exportCode" > endpoints/index.js`, // Replaces the "build/endpoints/index.js" file with exportCode var value that is set above. The code requires endpoint that is currently being built. @vercel/ncc doesn't support dynamic imports.
                  `ncc build ./index.js -s -o /asset-output`, // Build the code to a single file containing node_modules and remove all non used code is removed.
               ].join(' ; ')],
            },
         })
         hasApiCodeBeenBuilt = true
      } else {
         code = Code.fromAsset('../api/src')
      }

      if (runtime.family !== RuntimeFamily.NODEJS) throw new Error(`Runtime "${runtime.name}" not supported!`)

      const handlerFunc = this.createFunction(lambdaFunctionId, {
         name: `API_Endpoint__${endpointPathStringForId}`,
         handler: 'index.handler',
         env: environment,
         access,
         code,
         lambda,
      })


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |                  Create Resources                  |
      \*__________________________________________________*/

      const resourceStrings = path.replace(/^\//, '').split('/')
      const paths = resourceStrings.map((_, i) => `/${resourceStrings.filter((_, j) => j <= i).join('/')}`)

      resourceStrings.forEach((resourceString, i) => {
         if (this.existingResources.find((er) => er.path === paths[i])) return
         const parentResource = (i === 0)
            ? this.api.root
            : (this.existingResources.find((er) => er.path === paths[i - 1]) || {}).resource
         if (!parentResource) throw new Error('There was a problem creating resources for REST API Endpoint. Failed to get existing resource.')

         const newResource = parentResource.addResource(resourceString)

         this.existingResources.push({
            path: paths[i],
            resource: newResource,
         })
      })


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |                   Create Method                    |
      \*__________________________________________________*/

      const resource = (this.existingResources.find((er) => er.path === path) || {}).resource
      if (!resource) throw new Error('There was a problem creating resources for REST API Endpoint.')

      const lambdaProxyIntegration = new LambdaIntegration(handlerFunc)
      const apiMethod = resource.addMethod(method, lambdaProxyIntegration, {
         apiKeyRequired: isApiKeyRequired,
         // TODO: Authorization
         // authorizer: authorizer && {
         //    authorizationType: AuthorizationType.CUSTOM,
         //    authorizerId: authorizer.ref,
         // },
      })
      if (authorizer) apiMethod.node.addDependency(authorizer)


      /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
      |      Allow ApiGateway to Invoke the Function       |
      \*__________________________________________________*/

      // Grant access for the endpoint to invoke the Lambda function
      handlerFunc.addPermission(`${endpointId}_InvokePermission`, {
         principal: new ServicePrincipal('apigateway.amazonaws.com'),
         sourceArn: this.stack.formatArn({
            service: 'execute-api',
            resource: this.api.restApiId,
            resourceName: `*/*${path}`,
         }),
      })

   }

}
