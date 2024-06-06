import {
  CodeDeployClient,
  CreateDeploymentCommand
} from '@aws-sdk/client-codedeploy'

export async function deploy({
  applicationName,
  deploymentGroupName,
  deploymentConfigName = 'CodeDeployDefault.LambdaAllAtOnce',
  autoRollbackConfiguration,
  revision
}: {
  applicationName: string
  deploymentGroupName: string
  deploymentConfigName?: string
  autoRollbackConfiguration: string
  revision: RevisionLocation
}): Promise<void> {
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
      revision: {
        revisionType: 'AppSpecContent',
        appSpecContent: {
          content: JSON.stringify({
            version: '0.0.1',
            Resources: [
              {
                blue: {
                  Type: 'AWS::Lambda::Function',
                  Properties: {
                    Name: 'blue',
                    Alias: 'Live',
                    CurrentVersion: 1,
                    TargetVersion: 2
                  }
                }
              }
            ]
          })
        }
      }
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
