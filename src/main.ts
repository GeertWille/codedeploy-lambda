// inputs:
//   applicationName:
//     description: 'The name of the CodeDeploy application'
//     required: true
//   deploymentGroupName:
//     description: 'The name of the CodeDeploy deployment group'
//     required: true
//   revisionType:
//     description: 'The revision type to deploy'
//     required: false
//     default: 'AppSpecContent'
//   deploymentConfigName:
//     description: 'The name of the CodeDeploy deployment config'
//     required: false
//     default: 'CodeDeployDefault.LambdaAllAtOnce'
//   description:
//     description: 'The description of the deployment'
//     required: false
//   ignoreApplicationStopFailures:
//     description:
//       'Whether to continue the deployment if the ApplicationStop lifecycle event
//       fails'
//     required: false
//     default: false
//   autoRollbackConfiguration:
//     description:
//       'The configuration for automatically rolling back the deployment'
//     required: false
//     default: '{"enabled": true, "events": ["DEPLOYMENT_FAILURE"]}'
//   updateOutdatedInstancesOnly:
//     description: 'Whether to only update instances that are outdated'
//     required: false
//     default: true

import * as core from '@actions/core'
import { findLambdas } from './findLambdas'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // const applicationName: string = core.getInput('applicationName')
    // const deploymentGroupName: string = core.getInput('deploymentGroupName')
    // const revisionType: string = core.getInput('revisionType')
    // const deploymentConfigName: string = core.getInput('deploymentConfigName')
    // const description: string = core.getInput('description')
    // const ignoreApplicationStopFailures: boolean = core.getBooleanInput(
    //   'ignoreApplicationStopFailures'
    // )
    // const autoRollbackConfiguration: string = core.getInput(
    //   'autoRollbackConfiguration'
    // )
    // const updateOutdatedInstancesOnly: boolean = core.getBooleanInput(
    //   'updateOutdatedInstancesOnly'
    // )

    await findLambdas({
      Application: ['Betting-Api', 'Hub88-Api']
    })

    // await deploy()

    // // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    // // Print all inputs to the log
    // core.debug(`Inputs: ${JSON.stringify(core.getInput)}`)

    // // Log the current timestamp, wait, then log the new timestamp
    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    // // Set outputs for other workflow steps to use
    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
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
