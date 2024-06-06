import {
  CodeDeployClient,
  CreateDeploymentCommand
} from '@aws-sdk/client-codedeploy'
import { DeployInput } from './types'

export async function deploy({
  applicationName,
  deploymentGroupName,
  deploymentConfigName = 'CodeDeployDefault.LambdaAllAtOnce',
  // autoRollbackConfiguration,
  revision
}: DeployInput): Promise<void> {
  const codeDeployClient = new CodeDeployClient({})
  codeDeployClient.send(
    new CreateDeploymentCommand({
      applicationName,
      deploymentGroupName,
      deploymentConfigName,
      //   autoRollbackConfiguration: {
      //     enabled: true,
      //     events: ['DEPLOYMENT_FAILURE']
      //   },
      revision
      // revision: {
      //   revisionType: 'AppSpecContent',
      //   appSpecContent: {
      //     content: JSON.stringify({
      //       version: '0.0.1',
      //       Resources: [
      //         {
      //           blue: {
      //             Type: 'AWS::Lambda::Function',
      //             Properties: {
      //               Name: 'blue',
      //               Alias: 'Live',
      //               CurrentVersion: 1,
      //               TargetVersion: 2
      //             }
      //           }
      //         }
      //       ]
      //     })
      //   }
      // }
    })
  )
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
