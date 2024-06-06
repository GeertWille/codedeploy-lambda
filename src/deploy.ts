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
      revision
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
