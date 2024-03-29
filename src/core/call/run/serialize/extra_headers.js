import { Buffer } from 'node:buffer'

import lodash from 'lodash'

const { byteLength } = Buffer

// The `node-fetch` library adds few HTTP request headers, so we add them
// to `rawRequest`
// Unfortunately the library does not allow accessing them, so we need to repeat
// its logic here and recalculate them.
export const addFetchRequestHeaders = ({ call }) => {
  const headers = getFetchRequestHeaders({ call })
  const headersA = lodash.mapKeys(headers, (value, name) => `headers.${name}`)
  return { ...call, ...headersA }
}

const getFetchRequestHeaders = ({
  call: {
    'headers.accept': accept = DEFAULT_ACCEPT,
    'headers.accept-encoding': acceptEncoding = DEFAULT_ACCEPT_ENCODING,
    'headers.connection': connection = DEFAULT_CONNECTION,
  },
}) => ({ accept, 'accept-encoding': acceptEncoding, connection })

const DEFAULT_ACCEPT = '*/*'
const DEFAULT_ACCEPT_ENCODING = 'gzip,deflate'
const DEFAULT_CONNECTION = 'close'

// Same for `Content-Length` (must be done after body has been serialized)
export const addContentLength = ({ request, rawRequest }) => {
  const contentLength = getContentLength({ rawRequest })

  if (contentLength === undefined) {
    return { request, rawRequest }
  }

  const requestA = { ...request, 'headers.content-length': contentLength }
  const rawRequestA = {
    ...rawRequest,
    'headers.content-length': String(contentLength),
  }
  return { request: requestA, rawRequest: rawRequestA }
}

const getContentLength = ({ rawRequest: { method, body } }) => {
  if (body !== undefined && body !== null) {
    return byteLength(body)
  }

  if (!CONTENT_LENGTH_METHODS.has(method)) {
    return
  }

  return 0
}

const CONTENT_LENGTH_METHODS = new Set(['put', 'post'])
