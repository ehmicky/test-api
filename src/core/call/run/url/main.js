import { normalizeUrl } from './normalize.js'
import { addUrlParams } from './params.js'
import { addPath } from './path.js'
import { addQueryParams } from './query.js'
import { getServer } from './server.js'

// Build request URL from request parameters
export const addUrl = ({ call, call: { request, rawRequest } = {} }) => {
  if (call === undefined) {
    return
  }

  const url = getFullUrl({ rawRequest })
  const rawRequestA = { ...rawRequest, url }
  const requestA = { ...request, url }

  return { call: { ...call, rawRequest: rawRequestA, request: requestA } }
}

const getFullUrl = ({ rawRequest }) => {
  const url = getServer({ rawRequest })
  const urlA = addPath({ url, rawRequest })
  const urlB = normalizeUrl(urlA)
  const urlC = addUrlParams(urlB, rawRequest)
  const urlD = addQueryParams(urlC, rawRequest)
  return urlD
}
