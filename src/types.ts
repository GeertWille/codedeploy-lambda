import { RevisionLocation } from '@aws-sdk/client-codedeploy'

export type DeployInput = {
  applicationName: string
  deploymentGroupName: string
  deploymentConfigName?: string
  autoRollbackConfiguration?: string
  revision: RevisionLocation
}
