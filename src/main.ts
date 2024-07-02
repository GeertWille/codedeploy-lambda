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
    const deploymentConfigName: string = core.getInput('deploymentConfigName')
    const description: string = core.getInput('description')
    const tagKey: string = core.getInput('tagKey')
    const tagValues: string[] = core
      .getInput('tagValues')
      .split(',')
      .map(value => value.trim())

    await deployApplication({
      applicationName,
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
  const allLambdas = await findLambdas({
    tags: {
      [data.tagKey]: data.tagValues
    },
    alias: LAMBDA_ALIAS
  })

  const lambdas = allLambdas.filter(
    lambda => lambda.latestVersion !== lambda.aliasVersion
  )
  const resources = lambdas.map(lambda => {
    return {
      [lambda.name]: fromLambdaFunctionToResource(lambda)
    }
  })

  if (resources.length === 0) {
    core.notice('No lambdas to deploy')
    return
  }

  for (const resource of resources) {
    const input: DeployInput = {
      applicationName: data.applicationName,
      deploymentGroupName: Object.keys(resource)[0],
      deploymentConfigName: data.deploymentConfigName,
      description: data.description,
      revision: {
        revisionType: 'AppSpecContent',
        appSpecContent: {
          content: JSON.stringify({
            version: '0.0.1',
            Resources: [resource]
          })
        }
      }
    }

    await delay(1000)
    await deploy(input)
  }

  core.info('Deployments triggered:')
  lambdas.forEach(lambda => {
    core.info(
      `  - ${lambda.name}: ${lambda.aliasVersion} -> ${lambda.latestVersion}`
    )
  })
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const fromLambdaFunctionToResource = (
  lambdaFunction: LambdaFunction
): Resource => {
  return {
    Type: 'AWS::Lambda::Function',
    Properties: {
      Name: lambdaFunction.name,
      Alias: LAMBDA_ALIAS,
      CurrentVersion: lambdaFunction.aliasVersion,
      TargetVersion: lambdaFunction.latestVersion
    }
  }
}
