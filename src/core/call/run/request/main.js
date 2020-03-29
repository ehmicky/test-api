import { fireRequest } from './fetch.js'

// Fire actual HTTP call
export const request = async function ({ call, call: { rawRequest } = {} }) {
  if (call === undefined) {
    return
  }

  const rawResponse = await fireRequest({ rawRequest })
  return { call: { ...call, rawResponse } }
}
