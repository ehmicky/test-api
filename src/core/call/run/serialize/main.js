import { excludeKeys } from 'filter-obj'
import lodash from 'lodash'

import { stringifyFlat } from '../../../../utils/flat.js'
import { keyToLocation } from '../../../../utils/location.js'
import { findBodyHandler } from '../../body.js'

import { normalizeContentType } from './content_type.js'
import { addContentLength, addFetchRequestHeaders } from './extra_headers.js'
import { normalizeMethod } from './method.js'
import { normalizeUserAgent } from './user_agent.js'

// Serialize request parameters
// Request headers name are only allowed lowercase:
//  - it makes matching them easier, both for other plugins and for the
//    return value.
//  - this implies server must ignore headers case
//  - other plugins modifying `request.call` must use lowercase headers
export const serialize = async ({ call }) => {
  if (call === undefined) {
    return
  }

  const callA = await normalizeCall({ call })

  const request = addFetchRequestHeaders({ call: callA })

  const requestA = excludeKeys(request, isUndefined)

  const rawRequest = lodash.mapValues(requestA, stringifyParam)

  const { request: requestB, rawRequest: rawRequestA } = addContentLength({
    request: requestA,
    rawRequest,
  })

  return { call: { ...call, request: requestB, rawRequest: rawRequestA } }
}

const normalizeCall = async ({ call }) => {
  const callA = normalizeContentType({ call })

  const callB = normalizeMethod({ call: callA })

  const callC = await normalizeUserAgent({ call: callB })

  const callD = normalizeTimeout({ call: callC })

  return callD
}

const normalizeTimeout = ({
  call: { timeout = DEFAULT_TIMEOUT, ...call },
}) => ({ ...call, timeout })

const DEFAULT_TIMEOUT = 1e6

const isUndefined = (key, value) => value === undefined

const stringifyParam = (value, key, call) => {
  const { location } = keyToLocation({ key })
  return PARAM_STRINGIFIERS[location]({ value, call })
}

// `url`, `query` and `header` values might not be strings.
// In which case they are JSON stringified
const stringifyParamFlat = ({ value }) => stringifyFlat(value)

// Stringify the request body according to HTTP request header `Content-Type`
const stringifyBody = ({
  value,
  call: { 'headers.content-type': contentType },
}) => {
  // Default stringifiers tries JSON.stringify()
  const { stringify = stringifyFlat } = findBodyHandler({ mime: contentType })

  return stringify(value)
}

// Keep `timeout` as an integer, and assign default value
const keepAsIs = ({ value }) => value

const PARAM_STRINGIFIERS = {
  method: stringifyParamFlat,
  server: stringifyParamFlat,
  path: stringifyParamFlat,
  url: stringifyParamFlat,
  query: stringifyParamFlat,
  headers: stringifyParamFlat,
  body: stringifyBody,
  timeout: keepAsIs,
  https: keepAsIs,
}
