const pathJoin = require('path').join
const { Runtime, RuntimeFamily, Code } = require('@aws-cdk/aws-lambda')
const { BundlingDockerImage, AssetHashType } = require('@aws-cdk/core')
const { LambdaIntegration } = require('@aws-cdk/aws-apigateway')
const { ServicePrincipal } = require('@aws-cdk/aws-iam')
const LambdaGenerator = require('../LambdaGenerator')


module.exports = class RoutesGenerator extends LambdaGenerator {

   /**
    * @param {import('@aws-cdk/core').Stack} stack
    * @param {import('@aws-cdk/aws-apigateway').RestApi} api
    * @param {import('@aws-cdk/aws-lambda').LayerVersion} sharedNodeModulesLayer
    */
   constructor(stack, api, sharedNodeModulesLayer) {
      super(stack, sharedNodeModulesLayer)
      /** @type {{ path: Path, resource: import('@aws-cdk/aws-apigateway').Resource }[]} */
      this.existingResources = []
      this.api = api
   }

   /**
    * @typedef {string} Path
    * Route for the API method.
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
   addRoute(method, path, props) {
      const { isApiKeyRequired, authorizer, access = {}, lambda = {}, env = {} } = props || {}

      const routePathStringForId = (`${path.replace(/^\//, '').replace(/\//g, '_')}_${method}`).replace(/\{/g, '-').replace(/\}/g, '-')
      const routeId = `API_Route__${routePathStringForId}`
      const lambdaFunctionId = `API_LambdaFunc__${routePathStringForId}`


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
      const layers = [this.sharedNodeModulesLayer]
      const code = Code.fromAsset('../api/src', {
         exclude: ['eventHandlers'],
      })

      if (runtime.family !== RuntimeFamily.NODEJS) throw new Error(`Runtime "${runtime.name}" not supported!`)

      const handlerFunc = this.createFunction(lambdaFunctionId, {
         name: `API_Endpoint__${routePathStringForId}`,
         handler: 'index-api.handler',
         env: environment,
         access,
         code,
         layers,
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

      // Grant access for the route to invoke the Lambda function
      handlerFunc.addPermission(`${routeId}_InvokePermission`, {
         principal: new ServicePrincipal('apigateway.amazonaws.com'),
         sourceArn: this.stack.formatArn({
            service: 'execute-api',
            resource: this.api.restApiId,
            resourceName: `*/*${path}`,
         }),
      })

   }

}
