const { Table, AttributeType } = require('@aws-cdk/aws-dynamodb')


/**
 * @param {import('@aws-cdk/core').Stack} stack
 * @returns {Table}
 */
module.exports = function createCommentsTable(stack) {

   const table = new Table(stack, `Table_Comments`, {
      tableName: 'Comments',
      partitionKey: { name: 'id', type: AttributeType.STRING },
   })

   table.addGlobalSecondaryIndex({
      indexName: 'videoId-score',
      partitionKey: { name: 'videoId', type: AttributeType.STRING },
      sortKey: { name: 'score', type: AttributeType.NUMBER },
   })

   table.addGlobalSecondaryIndex({
      indexName: 'videoId-dateCreated',
      partitionKey: { name: 'videoId', type: AttributeType.STRING },
      sortKey: { name: 'dateCreated', type: AttributeType.NUMBER },
   })

   return table
}
