# AWS CDK

[What is the AWS CDK?](https://docs.aws.amazon.com/cdk/latest/guide/home.html)


## Setup

### 1. Install AWS CLI
[AWS CLI installation guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

### 2. Setup aws profile
```
aws configure --profile <new-profile-name>
```
Configure `AWS Access Key ID`, `AWS Secret Access Key` and `Default region name`\
Make sure you input correct values because CDK commands hang if profile/region is invalid.

### 3. Install Docker
[Docker](https://www.docker.com/products/docker-desktop) is used for building code.
<br/><br/>

### 4. Install packages
```
yarn install
```

## Development
[AWS CDK - API Reference](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html)\
Stacks are initialized in [`./src/app.js`](./src/app.js)
<br/><br/>


## Deployment

The first time you deploy an AWS CDK app into an environment (account/region), you’ll need to install a [“bootstrap stack”](https://github.com/aws/aws-cdk/blob/master/design/cdk-bootstrap.md).

```
yarn cdk bootstrap --profile <profile>
```

Deploy stacks using command:
```
yarn cdk deploy <stacks> --profile <profile>
```
<br/>


## Useful commands
 * `yarn run test`            perform the jest unit tests
 * `yarn cdk deploy`          deploy this stack to your default AWS account/region
 * `yarn cdk diff`            compare deployed stack with current state
 * `yarn cdk synth`           emits the synthesized CloudFormation template

**NOTE:** Make sure you are running the commands with correct AWS [profile](#-2.-setup-aws-profile)
<br/><br/><br/>



## Running AWS locally

[AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) and Docker are is required for running AWS locally.


### Lambda functions

[Follow instructions at AWS DOCS](https://docs.aws.amazon.com/cdk/latest/guide/sam.html)

6. Run your AWS CDK app and create a AWS CloudFormation template
```
cdk synth --no-staging > template.yaml
```

7. Find the logical ID for your Lambda function in template.yaml. It will look like MyFunction12345678, where 12345678 represents an 8-character unique ID that the AWS CDK generates for all resources. The line right after it should look like:
```
Type: AWS::Lambda::Function
```

8. Run the function by executing:
```
sam local invoke MyFunction12345678 --no-event
```

### Example for running a lambda function

```
sam local invoke <functionId> -e ./test-events/<functionId>.json
```
The data set to `./test-events/<functionId>.json` file is passed to lambda function as the event parameter.

Single Lambda function can be also ran without AWS SAM (not recommended). Instructions [here](../api/src/README.md).



### Running API Gateway locally

Currently not possible with HttpApi that we are using: [Awslabs issue no. 1641](https://github.com/awslabs/aws-sam-cli/issues/1641)
