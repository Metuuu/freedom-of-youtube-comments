#!/usr/bin/env node

// -- ENVIRONMENTS --
// TODO: load from env files

const ACCOUNT_DEVELOPMENT = ''
// const ACCOUNT_STAGING = ''
// const ACCOUNT_PRODUCTION = ''

if (process.env.CDK_DEFAULT_ACCOUNT === ACCOUNT_DEVELOPMENT) process.env.IS_DEVELOPMENT = 'true'
// else if (process.env.CDK_DEFAULT_ACCOUNT === ACCOUNT_STAGING) process.env.IS_STAGING = 'true'
// else if (process.env.CDK_DEFAULT_ACCOUNT === ACCOUNT_PRODUCTION) process.env.IS_PRODUCTION = 'true'

if (![ACCOUNT_DEVELOPMENT].includes(process.env.CDK_DEFAULT_ACCOUNT)) {
   throw new Error('The Stack is trying to be uploaded to wrong account!')
}


// -- IMPORTS --

const cdk = require('@aws-cdk/core')
const DbStack = require('./stacks/db/DbStack')
const ApiStack = require('./stacks/api/ApiStack')

const app = new cdk.App()



// -- STACKS --

const dbStack = new DbStack(app, 'FreedomOfYoutubeCommentsDbStack')
new ApiStack(app, 'FreedomOfYoutubeCommentsApiStack', dbStack.tables)
