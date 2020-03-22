import { TestApiError } from '../../../../errors/error.js'

// Retrieve `task.call.path`
export const addPath = function ({ url, rawRequest: { path = '' } }) {
  validatePath({ path })

  return `${url}${path}`
}

const validatePath = function ({ path }) {
  if (path === '' || path.startsWith('/')) {
    return
  }

  throw new TestApiError('Request path must start with a slash', {
    property: 'task.call.path',
    value: path,
  })
}
