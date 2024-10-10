import { findLambdas } from '../src/findLambdas'
;(async () => {
  const result = await findLambdas({ tags: {}, alias: 'live' })

  console.log(result)
})()
