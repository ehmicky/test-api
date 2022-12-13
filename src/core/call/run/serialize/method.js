import METHODS from 'methods'

import { TestApiError } from '../../../../errors/error.js'

// Validate `task.call.method` and add default value
export const normalizeMethod = ({
  call,
  call: { method = DEFAULT_METHOD },
}) => {
  validateMethod({ method })

  return { ...call, method }
}

const DEFAULT_METHOD = 'GET'

const validateMethod = ({ method }) => {
  if (METHODS_SET.has(method.toLowerCase())) {
    return
  }

  throw new TestApiError(`HTTP method '${method}' does not exist`, {
    props: { property: 'task.call.method', value: method },
  })
}

const METHODS_SET = new Set(METHODS)
