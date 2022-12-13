import lodash from 'lodash'
import omit from 'omit.js'

import { getNegotiationsResponse } from './content_negotiation.js'
import { normalizeSchema } from './json_schema.js'

// Normalize OpenAPI responses into specification-agnostic format
export const normalizeResponses = ({
  spec,
  operation,
  operation: { responses },
}) =>
  lodash.mapValues(responses, (response) =>
    normalizeResponse({ response, spec, operation }),
  )

const normalizeResponse = ({ response, spec, operation }) => {
  const body = getResponseBody({ response })
  const headers = getResponseHeaders({ response, spec, operation })
  return { body, ...headers }
}

const getResponseBody = ({ response: { schema = {} } }) =>
  normalizeSchema({ schema })

const getResponseHeaders = ({
  response: { headers = {} },
  spec,
  operation,
}) => {
  const headersA = lodash.mapValues(headers, getResponseHeader)

  const contentNegotiations = getNegotiationsResponse({ spec, operation })
  const headersB = { ...contentNegotiations, ...headersA }

  const headersC = lodash.mapKeys(headersB, normalizeHeaderKey)
  return headersC
}

const getResponseHeader = (value) => {
  // We do not support `header` `collectionFormat`
  const schema = omit.default(value, ['collectionFormat'])

  const schemaA = normalizeSchema({ schema })
  return schemaA
}

const normalizeHeaderKey = (value, name) => {
  const nameA = name.toLowerCase()
  return `headers.${nameA}`
}
