import { GetFunctionCommand, LambdaClient } from '@aws-sdk/client-lambda'
import {
  GetResourcesCommand,
  ResourceGroupsTaggingAPI
} from '@aws-sdk/client-resource-groups-tagging-api'
import z from 'zod'

const LambdaFunctionDTOSchema = z.object({
  Configuration: z.object({
    FunctionName: z.string(),
    Version: z.string()
  })
})

export type LambdaFunction = {
  name: string
  aliasVersion: string
}

export async function findLambdas({
  tags,
  alias
}: {
  tags: Record<string, string[]>
  alias: string
}): Promise<LambdaFunction[]> {
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
    .map(value => getLambdaFunction(`${value.ResourceARN}:${alias}`))
  return Promise.all(promises)
}

const getLambdaFunction = async (
  functionArn: string
): Promise<LambdaFunction> => {
  const client = new LambdaClient()
  const data = await client.send(
    new GetFunctionCommand({ FunctionName: functionArn })
  )

  const validated = LambdaFunctionDTOSchema.safeParse(data)

  if (!validated.success) {
    throw new Error('Failed to validate LambdaFunctionDTO')
  }

  const dto = validated.data

  const lambdaFunction: LambdaFunction = {
    name: dto.Configuration.FunctionName,
    aliasVersion: dto.Configuration.Version
  }

  return lambdaFunction
}

const isResourceArn = (
  resource: unknown
): resource is { ResourceARN: string } => {
  return typeof resource === 'object' && !!resource && 'ResourceARN' in resource
}
