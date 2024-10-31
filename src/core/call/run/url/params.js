import { compile, parse } from 'path-to-regexp'

import { TestApiError } from '../../../../errors/error.js'
import { getPath } from '../../../../utils/path.js'
import { removePrefixes } from '../../../../utils/prefix.js'

// Replace `url` request parameters to the request URL.
// Can replace in both `task.call.server` and `task.call.path`
// Uses `path-to-regexp` syntax, e.g. `:NAME` or `{:NAME}`
// The library calls `encodeURIComponent()` on each URL variable
export const addUrlParams = (url, rawRequest) => {
  const urlParams = removePrefixes(rawRequest, 'url')

  const parseResult = parseUrl(url)
  const urlA = serializeUrl(parseResult, urlParams)
  return urlA
}

// Parse URL `:NAME` variables tokens
const parseUrl = (url) => {
  const urlA = url.replaceAll(URL_COLON_REGEXP, '\\$&')
  return parse(urlA)
}

// `path-to-regexp` would otherwise consider colons `:PORT` and `http://` to
// be variables
const URL_COLON_REGEXP = /:(\d|\/)/gu

// Replace URL `:NAME` tokens by `call.url.*` values
// We run `tokensToFunction` on each `token` instead of once on all of them
// so the error handler knows which `token` failed without parsing the
// error message
const serializeUrl = (parseResult, urlParams) => {
  try {
    return compile(parseResult)(urlParams)
  } catch (error) {
    throwError(error)
  }
}

const throwError = (error) => {
  const property = getPath(['task', 'call'])
  throw new TestApiError(`The URL parameters are invalid: ${error.message}`, {
    props: { property },
  })
}
