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
<br/><br/>


### Generating template.yaml

First run `yarn cdk synth --no-staging > template.yaml` to generate the file.\
Then open the template.yaml file and remove excess yarn output from the file.
```
yarn run vX.XX.XX          // REMOVE
$ cdk synth --no-staging   // REMOVE

// ... yaml content

Done in X.XXs.             // REMOVE
```

When we run `cdk synth --no-staging`, the CDK does not stage the source code in a new, temporary directory. This prevents your directory from clogging up with temporary directories, and makes the CloudFormation a bit easier to read. Also, when debugging your code using breakpoints and such, you don't have to open the staged code in the temporary directory to set these breakpoints.
<br/><br/>


### Lambda functions

[Follow instructions at AWS DOCS](https://docs.aws.amazon.com/cdk/latest/guide/sam.html)

### Example for running a lambda function

```
sam local invoke <functionId> -e ./test-events/<functionId>.json
```
The data set to `./test-events/<functionId>.json` file is passed to lambda function as the event parameter.
<br/><br/>


### Running API Gateway locally

[AWS Docs](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-start-api.html)

Generate [template.yaml](#Generating-template.yaml)\
Then run [`sam local start-api`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-start-api.html)
