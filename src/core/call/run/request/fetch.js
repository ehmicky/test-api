import got from 'got'

import { removePrefixes } from '../../../../utils/prefix.js'
import { TestApiError } from '../../../../errors/error.js'

import { getAgent } from './agent.js'

export const fireRequest = async function ({
  rawRequest,
  rawRequest: { method, url, body, timeout, https },
}) {
  const headers = removePrefixes(rawRequest, 'headers')
  const agent = getAgent({ https, url })

  try {
    return await got({ url, method, headers, body, timeout, agent })
  } catch (error) {
    throw new TestApiError(`Could not connect to '${url}': ${error.message}`)
  }
}
