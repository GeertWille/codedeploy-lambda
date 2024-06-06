import * as core from '@actions/core'
import { deploy } from './deploy'
import { LambdaFunction, findLambdas } from './findLambdas'
import { DeployApplicationInput, DeployInput, Resource } from './types'

const LAMBDA_ALIAS = 'live'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const applicationName: string = core.getInput('applicationName')
    const deploymentGroupName: string = core.getInput('deploymentGroupName')
    const deploymentConfigName: string = core.getInput('deploymentConfigName')
    const description: string = core.getInput('description')
    const tagKey: string = core.getInput('tagKey')
    const tagValues: string[] = core
      .getInput('tagValues')
      .split(',')
      .map(value => value.trim())

    await deployApplication({
      applicationName,
      deploymentGroupName,
      deploymentConfigName,
      description,
      tagKey,
      tagValues
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

const deployApplication = async (
  data: DeployApplicationInput
): Promise<void> => {
  const lambdas = await findLambdas({
    tags: {
      [data.tagKey]: data.tagValues
    },
    alias: LAMBDA_ALIAS
  })

  const resources = lambdas.map(lambda => {
    return {
      [lambda.name]: fromLambdaFunctionToResource(lambda)
    }
  })

  const input: DeployInput = {
    applicationName: data.applicationName,
    deploymentGroupName: data.deploymentGroupName,
    deploymentConfigName: data.deploymentConfigName,
    description: data.description,
    revision: {
      revisionType: 'AppSpecContent',
      appSpecContent: {
        content: JSON.stringify({
          version: '0.0.1',
          Resources: resources
        })
      }
    }
  }

  // console.info(util.inspect({ input }, { depth: null }))
  await deploy(input)
}

const fromLambdaFunctionToResource = (
  lambdaFunction: LambdaFunction
): Resource => {
  return {
    Type: 'AWS::Lambda::Function',
    Properties: {
      Name: lambdaFunction.name,
      Alias: LAMBDA_ALIAS,
      CurrentVersion: lambdaFunction.aliasVersion,
      TargetVersion: '$LATEST'
    }
  }
}

// {
//   "version": "0.0",
//   "Resources":[{
//     "blue":{
//       "Type": "AWS::Lambda::Function",
//       "Properties":{
//         "Name":"blue",
//         "Alias":"Blue",
//         "CurrentVersion":2,
//         "TargetVersion": 1
//       }
//     }
//   },
//   {
//     "blue":{
//       "Type": "AWS::Lambda::Function",
//       "Properties":{
//         "Name":"blue",
//         "Alias":"Blue",
//         "CurrentVersion":2,
//         "TargetVersion": 1
//       }
//     }
//   }]
// }

// {
//     "applicationName": "Test",
//     "deploymentGroupName": "Test",
//     "revision": {
//         "revisionType": "AppSpecContent",
//         "appSpecContent": {
//             "content": "{\"version\":\"0.0\",\"Resources\":[{\"blue\":{\"Type\":\"AWS::Lambda::Function\",\"Properties\":{\"Name\":\"blue\",\"Alias\":\"Blue\",\"CurrentVersion\":2,\"TargetVersion\":1}}}]}"
//         }
//     },
//     "deploymentConfigName": "CodeDeployDefault.LambdaAllAtOnce"
// }

// # {
// #     "applicationName": "",
// #     "deploymentGroupName": "",
// #     "revision": {
// #         "revisionType": "AppSpecContent",
// #         "appSpecContent": {
// #             "content": ""
// #         }
// #     },
// #     "deploymentConfigName": "",
// #     "description": "",
// #     "ignoreApplicationStopFailures": true,
// #     "autoRollbackConfiguration": {
// #         "enabled": true,
// #         "events": [
// #             "DEPLOYMENT_FAILURE"
// #         ]
// #     },
// #     "updateOutdatedInstancesOnly": true,
// #     "overrideAlarmConfiguration": {
// #         "enabled": true,
// #         "ignorePollAlarmFailure": true,
// #         "alarms": [
// #             {
// #                 "name": ""
// #             }
// #         ]
// #     }
// # }
