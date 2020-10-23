const RoutesGenerator = require('./RoutesGenerator')
const { GET, POST, DELETE } = require('../../../enums/HttpMethod')


/**
 * @param {import('@aws-cdk/core').Stack} stack
 * @param {import('@aws-cdk/aws-lambda').LayerVersion} nodeModulesLambdaLayer
 * @param {import('@aws-cdk/aws-apigateway').RestApi} api
 * @param {import('@aws-cdk/aws-apigateway').Authorizer?} authorizer
 * @param {import('../../db/DbStack').DBTables} dbTables Tables for granting lambda func permissions and setting table name env vars
 */
function setupRoutes(stack, nodeModulesLambdaLayer, api, authorizer, dbTables) {

   const rg = new RoutesGenerator(stack, api, nodeModulesLambdaLayer)

   // Endpoints

   rg.addRoute(GET, '/comments', {
      isApiKeyRequired: true,
      access: {
         db: { read: [dbTables.comments] },
      },
   })

   // rg.addRoute(POST, '/comments', {
   //    isApiKeyRequired: true,
   //    access: {
   //       db: {
   //          readWrite: [dbTables.comments, dbTables.userVotes],
   //       },
   //    },
   // })

   // rg.addRoute(GET, '/comments/{commentId}/replies', {
   //    isApiKeyRequired: true,
   //    access: {
   //       db: { read: [dbTables.comments] },
   //    },
   // })

   // rg.addRoute(POST, '/comments/{commentId}/replies', {
   //    isApiKeyRequired: true,
   //    access: {
   //       db: {
   //          readWrite: [dbTables.commentReplies, dbTables.userVotes],
   //       },
   //    },
   // })

   // rg.addRoute(DELETE, '/comments/{replyId}/replies/', {
   //    isApiKeyRequired: true,
   //    access: {
   //       db: {
   //          write: [dbTables.commentReplies, dbTables.userVotes],
   //       },
   //    },
   // })

}

module.exports = setupRoutes
