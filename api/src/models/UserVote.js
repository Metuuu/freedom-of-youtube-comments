const { DynamoDB } = require('aws-sdk')

const docClient = new DynamoDB.DocumentClient()


class UserVote {

   /**
    * @param {string} userId
    * @param {string} commentId
    * @param {import('../enums/UserVoteType')} type
    */
   constructor(userId, commentId, type) {
      this.userId = userId
      this.commentId = commentId
      this.type = type
   }

   /**
    * Convers self to json object that can be sent to client
    * @returns {object}
    */
   toClient() {
      return this
   }


   /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
   |                       STATIC                       |
   \*__________________________________________________*/

   /**
    * @param {object} json
    * @returns {UserVote}
    */
   static fromDbObject(json) {
      const { userIdCommentIdCompound, type } = json
      const [userId, commentId] = userIdCommentIdCompound.split('_')
      return new UserVote(userId, commentId, type)
   }

   /**
    * @param {string} commentId
    * @param {boolean} isUpvote
    * @returns {Promise}
    */
   static async voteComment(commentId, isUpvote) {
      // TODO: Increment/decrease comment score
      // TODO: Edit users voted comments
   }

   /**
    * @param {string} commentId
    * @returns {Promise}
    */
   static async unvoteComment(commentId) {
      // TODO: Increment/decrease comment score
      // TODO: Remove users voted comment
   }

}

module.exports = UserVote
