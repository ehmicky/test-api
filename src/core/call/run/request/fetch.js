import got from 'got'

import { TestApiError } from '../../../../errors/error.js'
import { removePrefixes } from '../../../../utils/prefix.js'

import { getAgent } from './agent.js'

export const fireRequest = async function ({
  rawRequest,
  rawRequest: { method, url, body, timeout, https },
}) {
  const headers = removePrefixes(rawRequest, 'headers')
  const agent = getAgent({ https, url })

  try {
    const {
      statusCode,
      headers: headersA,
      body: bodyA,
    } = await got({
      url,
      method,
      headers,
      body,
      timeout: { request: timeout },
      agent,
    })
    const responseHeaders = getResponseHeaders(headersA)
    return { status: statusCode, ...responseHeaders, body: bodyA }
  } catch (error) {
    handleRequestError(error, { url, timeout })
  }
}

// Normalize response headers to a plain object
// Response headers name are normalized to lowercase:
//  - it makes matching them easier, both for other plugins and for the
// return value.
//  - this implies original case is lost
//  - it is automatically done by both the Fetch standard and Node.js
//    core `http` module
const getResponseHeaders = function (headers) {
  const headersA = Object.entries(headers)
  const headersB = headersA.map(([name, value]) => ({
    [`headers.${name}`]: Array.isArray(value) ? value.join('\n') : value,
  }))
  const headersC = Object.assign({}, ...headersB)
  return headersC
}

const handleRequestError = function ({ name, message }, { url, timeout }) {
  if (name === 'TimeoutError') {
    throw new TestApiError(`The request took more than ${timeout} milliseconds`)
  }

  if (name === 'ReadError') {
    throw new TestApiError(`Could not read response body: ${message}`, {
      property: 'task.call.response.body',
    })
  }

  throw new TestApiError(`Could not connect to '${url}': ${message}`)
}
