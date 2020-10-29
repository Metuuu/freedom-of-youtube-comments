const EndpointsGenerator = require('./EndpointsGenerator')
const { GET, POST, DELETE } = require('../../../enums/HttpMethod')


/**
 * @param {import('@aws-cdk/core').Stack} stack
 * @param {import('@aws-cdk/aws-apigateway').RestApi} api
 * @param {import('@aws-cdk/aws-apigateway').Authorizer?} authorizer
 * @param {import('../../db/DbStack').DBTables} dbTables Tables for granting lambda func permissions and setting table name env vars
 * @param {import('@aws-cdk/aws-lambda').LayerVersion} [nodeModulesLambdaLayer]
 */
function setupEndpoints(stack, api, authorizer, dbTables, nodeModulesLambdaLayer) {

   const rg = new EndpointsGenerator(stack, api, nodeModulesLambdaLayer)

   // Endpoints

   rg.addEndpoint(GET, '/test/success')
   rg.addEndpoint(GET, '/test/error')

   rg.addEndpoint(GET, '/comments', {
      access: {
         db: { read: [dbTables.comments] },
      },
   })

   // rg.addEndpoint(POST, '/comments', {
   //    access: {
   //       db: {
   //          readWrite: [dbTables.comments, dbTables.userVotes],
   //       },
   //    },
   // })

   // rg.addEndpoint(GET, '/comments/{commentId}/replies', {
   //    access: {
   //       db: { read: [dbTables.comments] },
   //    },
   // })

   // rg.addEndpoint(POST, '/comments/{commentId}/replies', {
   //    access: {
   //       db: {
   //          readWrite: [dbTables.commentReplies, dbTables.userVotes],
   //       },
   //    },
   // })

   // rg.addEndpoint(DELETE, '/comments/{replyId}/replies/', {
   //    access: {
   //       db: {
   //          write: [dbTables.commentReplies, dbTables.userVotes],
   //       },
   //    },
   // })

}

module.exports = setupEndpoints
