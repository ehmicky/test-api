import METHODS from 'methods'

import { TestApiError } from '../../../../errors/error.js'

// Validate `task.call.method` and add default value
export const normalizeMethod = function({
  call,
  call: { method = DEFAULT_METHOD },
}) {
  validateMethod({ method })

  return { ...call, method }
}

const DEFAULT_METHOD = 'GET'

const validateMethod = function({ method }) {
  if (METHODS.includes(method.toLowerCase())) {
    return
  }

  throw new TestApiError(`HTTP method '${method}' does not exist`, {
    property: 'task.call.method',
    value: method,
  })
}
