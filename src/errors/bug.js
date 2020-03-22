import { BugError } from './error.js'

// Any error not using `TestApiError` is a bug
export const handleBugs = function ({ error }) {
  const bugError = findBugError({ error })

  if (bugError === undefined) {
    return error
  }

  const message = getBugMessage({ bugError })

  return new BugError(message, { module: bugError.module, bug: true })
}

const findBugError = function ({ error, error: { errors = [error] } }) {
  const errorA = errors.find(getBugError)

  if (errorA === undefined) {
    return
  }

  // Retrieve nested bug error if it's nested
  return getBugError(errorA)
}

const getBugError = function (error) {
  if (isBugError(error)) {
    return error
  }

  // Check for nested tasks errors
  const { nested: { error: nestedError } = {} } = error

  if (nestedError !== undefined) {
    return getBugError(nestedError)
  }
}

export const isBugError = function ({ name }) {
  return name !== 'TestApiError'
}

const getBugMessage = function ({
  bugError,
  bugError: { message, stack = message },
}) {
  const repositoryName = getRepositoryName({ bugError })

  return `A bug occurred.
Please report an issue on the '${repositoryName}' code repository and paste the following lines:

${stack}`
}

const getRepositoryName = function ({ bugError }) {
  if (module === undefined) {
    return DEFAULT_REPOSITORY
  }

  return `${MODULE_REPOSITORY}${bugError.module}`
}

const DEFAULT_REPOSITORY = 'test-api'
const MODULE_REPOSITORY = 'test-api-'
