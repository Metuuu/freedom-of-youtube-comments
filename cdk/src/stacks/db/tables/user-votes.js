const { Table, AttributeType } = require('@aws-cdk/aws-dynamodb')


/**
 * @param {import('@aws-cdk/core').Stack} stack
 * @returns {Table}
 */
module.exports = function createUserVotesTable(stack) {

   const table = new Table(stack, `Table_UserVotes`, {
      tableName: 'UserVotes',
      partitionKey: { name: 'userIdCommentIdCompound', type: AttributeType.STRING },
   })

   return table
}
