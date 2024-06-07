import { RevisionLocation } from '@aws-sdk/client-codedeploy'

export type DeployApplicationInput = {
  applicationName: string
  deploymentGroupName?: string
  deploymentConfigName?: string
  autoRollbackConfiguration?: string
  description?: string
  tagKey: string
  tagValues: string[]
}
export type DeployInput = {
  applicationName: string
  deploymentGroupName: string
  deploymentConfigName?: string
  autoRollbackConfiguration?: string
  revision: RevisionLocation
  description?: string
}

export type Resource = {
  Type: 'AWS::Lambda::Function'
  Properties: {
    Name: string
    Alias: string
    CurrentVersion: string
    TargetVersion: string
  }
}
