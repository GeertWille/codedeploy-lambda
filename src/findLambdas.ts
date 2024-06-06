import { GetFunctionCommand, LambdaClient } from '@aws-sdk/client-lambda'
import {
  GetResourcesCommand,
  ResourceGroupsTaggingAPI
} from '@aws-sdk/client-resource-groups-tagging-api'

export async function findLambdas(
  tags: Record<string, string[]>
): Promise<string[]> {
  const lambdas: string[] = []

  const resourceGroupsTaggingAPI = new ResourceGroupsTaggingAPI()
  const resources = await resourceGroupsTaggingAPI.send(
    new GetResourcesCommand({
      ResourceTypeFilters: ['lambda'],
      TagFilters: Object.entries(tags).map(([Key, Value]) => ({
        Key,
        Values: Value
      }))
    })
  )

  const lambdaArns = resources.ResourceTagMappingList ?? []

  const promises = lambdaArns
    .filter(isResourceArn)
    .map(value => getLambdaVersion(`${value.ResourceARN}:live`))
  const res = await Promise.all(promises)

  console.info({ res })
  //   console.info(resources['ResourceTagMappingList'])
  return ['']
}

const getLambdaVersion = async (functionArn: string): Promise<string> => {
  try {
    const client = new LambdaClient()
    const data = await client.send(
      new GetFunctionCommand({ FunctionName: functionArn })
    )
    console.log('Lambda Function Version:', data.Configuration?.Version)
    return data.Configuration?.Version ?? ''
  } catch (err) {
    console.error('Error', err)
    throw err
  }
}

const isResourceArn = (
  resource: unknown
): resource is { ResourceARN: string } => {
  return typeof resource === 'object' && !!resource && 'ResourceARN' in resource
}
