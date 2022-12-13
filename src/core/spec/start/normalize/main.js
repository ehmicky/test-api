import omit from 'omit.js'

import { getParams } from './params/main.js'
import { normalizeResponses } from './response.js'

// Normalize OpenAPI 2.0 operation into specification-agnostic format
export const normalizeSpec = ({ spec }) => {
  const operations = getOperations({ spec })
  return { operations }
}

const getOperations = ({ spec, spec: { paths } }) =>
  Object.entries(paths).flatMap(([path, pathDef]) =>
    getOperationsByPath({ spec, path, pathDef }),
  )

// Iterate over each HTTP method
const getOperationsByPath = ({ spec, path, pathDef }) => {
  const pathDefA = omit.default(pathDef, ['parameters'])

  return Object.entries(pathDefA).map(([method, operation]) =>
    getOperation({ spec, path, pathDef, operation, method }),
  )
}

// Normalize cherry-picked properties
const getOperation = ({ spec, path, pathDef, operation, method }) => {
  const operationId = getOperationId({ operation })
  const params = getParams({ spec, method, path, pathDef, operation })
  const responsesA = normalizeResponses({ spec, operation })

  return { ...operationId, params, responses: responsesA }
}

const getOperationId = ({ operation: { operationId } }) => {
  if (operationId === undefined) {
    return
  }

  return { operationId }
}
