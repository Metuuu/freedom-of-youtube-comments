const { DynamoDB } = require('aws-sdk')

const docClient = new DynamoDB.DocumentClient()


class Comment {

   /**
    * @param {string} id
    * @param {string} videoId YouTube video Id
    * @param {string} message
    * @param {number} score
    * @param {Date} dateCreated
    * @param {Date} [dateEdited]
    */
   constructor(id, videoId, message, score, dateCreated, dateEdited) {
      this.id = id
      this.videoId = videoId
      this.message = message
      this.score = score
      this.dateCreated = dateCreated
      this.dateEdited = dateEdited
   }

   /**
    * Convers self to json object that can be sent to client
    * @returns {object}
    */
   toClient() {
      return {
         ...this,
         // dateCreated: this.dateCreated.getTime(), // .toISOString()
         // dateEdited: this.dateEdited.getTime(),
      }
   }


   /*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
   |                       STATIC                       |
   \*__________________________________________________*/

   /**
    * Fetch DiseasePackage object from json object
    * @param {object} json
    * @returns {Comment}
    */
   static fromJson(json) {
      const { id, videoId, message, score, dateCreated, dateEdited } = json
      return new Comment(id, videoId, message, score, new Date(dateCreated), dateEdited ? new Date(dateEdited) : undefined)
   }

   /**
    * @param {string} userId
    * @param {string} id
    * @returns {Promise<Comment>}
    */
   static async getById(userId, id) {
      const getResult = await docClient
         .get({
            Key: { userId, id },
            TableName: process.env.TABLE_NAME__COMMENTS,
         })
         .promise()

      if (!getResult.Item) return null
      return this.fromJson(getResult.Item)
   }

}

module.exports = Comment
