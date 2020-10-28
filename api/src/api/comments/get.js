const Responses = require('@foyc/common-backend/models/Responses')
const validateParameters = require('@foyc/common-backend/utils/validateParameters')
const Comment = require('@foyc/common-backend/models/Comment')
const Joi = require('@hapi/joi')
const { DocumentClient } = require('aws-sdk/clients/dynamodb')

const docClient = new DocumentClient()

const queryValidationSchema = Joi.object().keys({
   videoId: Joi.string().required(),
}).required()


/**
 * Lists all orders for producer or users own orders
 * @param {import('../../index').ApiFunctionProps} props
 * @returns {Promise<import('aws-lambda').ProxyResult>}
 */
module.exports = async function getComments(props) {
   const { queryStringParameters } = props
   const { videoId } = await validateParameters(queryValidationSchema, queryStringParameters)


   const queryResponse = await docClient
      .query({
         TableName: process.env.TABLE_NAME__COMMENTS,
         KeyConditionExpression: 'videoId = :videoId',
         ExpressionAttributeValues: { ':videoId': videoId },
         IndexName: 'videoId-score',
         ScanIndexForward: false,
      })
      .promise()


   const commentsForClient = queryResponse.Items.map(Comment.fromJson)
   return Responses.SUCCESS(commentsForClient)
}
