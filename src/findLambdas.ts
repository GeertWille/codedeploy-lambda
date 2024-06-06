import {
  GetFunctionCommand,
  LambdaClient,
  ListVersionsByFunctionCommand
} from '@aws-sdk/client-lambda'
import {
  GetResourcesCommand,
  ResourceGroupsTaggingAPI
} from '@aws-sdk/client-resource-groups-tagging-api'
import * as core from '@actions/core'
import z from 'zod'
import util from 'util'

const LambdaFunctionDTOSchema = z.object({
  Configuration: z.object({
    FunctionName: z.string(),
    Version: z.string()
  })
})

export type LambdaFunction = {
  name: string
  latestVersion: string
  aliasVersion: string
}

const LambdaVersionsFunctionSchema = z.object({
  $metadata: z.object({
    httpStatusCode: z.number(),
    requestId: z.string(),
    extendedRequestId: z.string().optional(),
    cfId: z.string().optional(),
    attempts: z.number(),
    totalRetryDelay: z.number()
  }),
  NextMarker: z.string().optional(),
  Versions: z.array(
    z.object({
      Description: z.string(),
      TracingConfig: z.object({
        Mode: z.string()
      }),
      SnapStart: z.object({
        OptimizationStatus: z.string(),
        ApplyOn: z.string()
      }),
      RevisionId: z.string(),
      LastModified: z.string(),
      FunctionName: z.string(),
      Version: z.string(),
      PackageType: z.string(),
      FunctionArn: z.string(),
      MemorySize: z.number(),
      ImageConfigResponse: z.object({
        ImageConfig: z.object({
          WorkingDirectory: z.string(),
          Command: z.array(z.string())
        })
      }),
      Timeout: z.number(),
      CodeSha256: z.string(),
      Role: z.string(),
      CodeSize: z.number(),
      LoggingConfig: z.object({
        LogFormat: z.string(),
        LogGroup: z.string()
      }),
      Environment: z.object({
        Variables: z.record(z.string(), z.string())
      }),
      EphemeralStorage: z.object({
        Size: z.number()
      }),
      Architectures: z.array(z.string())
    })
  )
})

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

  const promises = lambdaArns.filter(isResourceArn).map(value =>
    getLambdaFunction({
      arn: value.ResourceARN,
      alias
    })
  )
  return Promise.all(promises)
}

const getAllVersions = async (arn: string) => {
  const client = new LambdaClient()
  let marker
  let allVersions = []

  do {
    const response: unknown = await client.send(
      new ListVersionsByFunctionCommand({
        FunctionName: `${arn}`,
        Marker: marker
      })
    )

    const validated = LambdaVersionsFunctionSchema.safeParse(response)

    if (!validated.success) {
      core.setFailed(JSON.stringify(validated.error, null, 2))
      throw new Error('Failed to validate LambdaVersionsFunction')
    }

    allVersions.push(...validated.data.Versions)
    marker = validated.data.NextMarker
  } while (marker)

  return allVersions
}

const getLambdaFunction = async ({
  arn,
  alias
}: {
  arn: string
  alias: string
}): Promise<LambdaFunction> => {
  const client = new LambdaClient()
  const [aliasLambda, versionsResponse] = await Promise.all([
    client.send(new GetFunctionCommand({ FunctionName: `${arn}:${alias}` })),
    getAllVersions(arn)
  ])

  const validated = LambdaFunctionDTOSchema.safeParse(aliasLambda)

  if (!validated.success) {
    core.setFailed(JSON.stringify(validated.error, null, 2))
    throw new Error('Failed to validate LambdaFunctionDTO')
  }

  const dto = validated.data

  const latestVersion = versionsResponse
    .filter(current => current.Version !== '$LATEST')
    .sort((a, b) => parseInt(b.Version) - parseInt(a.Version))[0].Version

  const lambdaFunction: LambdaFunction = {
    name: dto.Configuration.FunctionName,
    latestVersion: latestVersion,
    aliasVersion: dto.Configuration.Version
  }

  return lambdaFunction
}

const isResourceArn = (
  resource: unknown
): resource is { ResourceARN: string } => {
  return typeof resource === 'object' && !!resource && 'ResourceARN' in resource
}
