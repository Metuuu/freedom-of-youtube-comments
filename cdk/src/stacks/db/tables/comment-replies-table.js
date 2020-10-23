const { Table, AttributeType } = require('@aws-cdk/aws-dynamodb')


/**
 * @param {import('@aws-cdk/core').Stack} stack
 * @returns {Table}
 */
module.exports = function createCommentRepliesTable(stack) {

   const table = new Table(stack, `Table_CommentReplies`, {
      tableName: 'CommentReplies',
      partitionKey: { name: 'id', type: AttributeType.STRING },
   })

   table.addGlobalSecondaryIndex({
      indexName: 'commentId-dateCreated',
      partitionKey: { name: 'commentId', type: AttributeType.STRING },
      sortKey: { name: 'dateCreated', type: AttributeType.NUMBER },
   })

   return table
}
