# Monorepo for "Freedom of YouTube Comments" Project

## Backend

REST API for commenting YouTube videos where comments are disabled.

Comments are saved to DynamoDB.

Tools:
   - AWS CDK for backend deployment
   - AWS ApiGateway RestApi with Lambda integrations
   - AWS DynamoDB


## Frontend

Chrome extension for YouTube website that enables commenting via the custom REST API.
