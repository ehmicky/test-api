import { parse, tokensToFunction } from 'path-to-regexp'

import { TestApiError } from '../../../../errors/error.js'
import { getPath } from '../../../../utils/path.js'
import { removePrefixes } from '../../../../utils/prefix.js'

// Replace `url` request parameters to the request URL.
// Can replace in both `task.call.server` and `task.call.path`
// Uses same syntax as Express paths, e.g. `:NAME`, `:NAME*`, `:NAME+`
// or `(RegExp)`
// The library calls `encodeURIComponent()` on each URL variable
export const addUrlParams = function (url, rawRequest) {
  const urlParams = removePrefixes(rawRequest, 'url')

  const tokens = parseUrl(url)
  const urlA = serializeUrl(tokens, urlParams)
  return urlA
}

// Parse URL `:NAME` variables tokens
const parseUrl = function (url) {
  const urlA = url.replace(URL_COLON_REGEXP, '\\$&')
  const tokens = parse(urlA)
  return tokens
}

// `path-to-regexp` would otherwise consider colons `:PORT` and `http://` to
// be variables
const URL_COLON_REGEXP = /:(\d|\/)/gu

// Replace URL `:NAME` tokens by `call.url.*` values
// We run `tokensToFunction` on each `token` instead of once on all of them
// so the error handler knows which `token` failed without parsing the
// error message
const serializeUrl = function (tokens, urlParams) {
  return tokens.map((token) => serializeToken(token, urlParams)).join('')
}

const serializeToken = function (token, urlParams) {
  try {
    return tokensToFunction([token])(urlParams, { encode: encodeURIComponent })
  } catch (error) {
    throwError(`is invalid: ${error.message}`, token)
  }
}

const throwError = function (message, { name }) {
  const property = getPath(['task', 'call', `url.${name}`])
  throw new TestApiError(`The URL parameter '${name}' ${message}`, {
    props: { property },
  })
}
