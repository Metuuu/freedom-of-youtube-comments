const cdk = require('@aws-cdk/core')
const createCommentsTable = require('./tables/comments-table')
const createCommentRepliesTable = require('./tables/comment-replies-table')
const createUserVotesTable = require('./tables/user-votes')

/**
 * @typedef {Object} Table
 * @property {string} tableNameKey Table name is sent to Lambda functions via env variable using this as the env var name
 * @property {import('@aws-cdk/aws-dynamodb').Table} table
 */
/**
 * @typedef {{
 *    comments: Table,
 *    commentReplies: Table,
 *    userVotes: Table,
 * }} DBTables
 */


module.exports = class DbStack extends cdk.Stack {

   /**
    * @param {cdk.App} scope
    * @param {string} id
    * @param {cdk.StackProps=} props
    */
   constructor(scope, id, props) {
      super(scope, id, props)

      // Tables are not deleted when stack is destroyed (Check: RemovalPolicy)

      const commentsTable = createCommentsTable(this)
      const commentRepliesTable = createCommentRepliesTable(this)
      const userVotesTable = createUserVotesTable(this)

      /** @type {DBTables} */
      this.tables = {
         comments: { tableNameKey: 'TABLE_NAME__COMMENTS', table: commentsTable },
         commentReplies: { tableNameKey: 'TABLE_NAME__COMMENT_REPLIES', table: commentRepliesTable },
         userVotes: { tableNameKey: 'TABLE_NAME__USER_VOTES', table: userVotesTable },
      }

   }

}
