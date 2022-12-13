import { TestApiError } from './error.js'

// If any task failed, throw an error
export const handleFinalFailure = ({ tasks }) => {
  const errors = getFinalErrors({ tasks })

  if (errors.length === 0) {
    return
  }

  // Bundle several errors into one
  throw new TestApiError('Some tasks failed', { props: { tasks, errors } })
}

const getFinalErrors = ({ tasks }) =>
  tasks.filter(({ error }) => error !== undefined).map(({ error }) => error)
