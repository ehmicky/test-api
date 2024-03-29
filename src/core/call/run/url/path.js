import { TestApiError } from '../../../../errors/error.js'

// Retrieve `task.call.path`
export const addPath = ({ url, rawRequest: { path = '' } }) => {
  validatePath({ path })

  return `${url}${path}`
}

const validatePath = ({ path }) => {
  if (path === '' || path.startsWith('/')) {
    return
  }

  throw new TestApiError('Request path must start with a slash', {
    props: { property: 'task.call.path', value: path },
  })
}
