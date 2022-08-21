import lodash from 'lodash'
import statusesLib from 'statuses'

import { TestApiError } from '../../../errors/error.js'
import { merge } from '../../../utils/merge.js'
import { getWordsList } from '../../../utils/string.js'
import {
  parseStatus,
  serializeStatus,
} from '../../validate/run/status/parse.js'

// Add OpenAPI specification to `task.validate.*`
// Use the specification response matching both the current operation and
// the received status code `{ '200': validate, default: validate, ... }`
export const addSpecToValidate = function ({
  validate = {},
  pluginNames,
  operation: { responses, operationId },
}) {
  // Optional dependency
  if (!pluginNames.includes('validate')) {
    return
  }

  const status = getSpecStatus({ validate, responses, operationId })

  const responsesA = lodash.mapKeys(responses, (value, responseStatus) =>
    handleDefaultResponse({ responseStatus, responses }),
  )

  const validateA = merge({ status }, validate, responsesA)
  return validateA
}

// Modifies `validate.status` to only allow status codes described in the
// specification.
// If `validate.status` already exists, intersects with it.
const getSpecStatus = function ({
  validate: { status = DEFAULT_STATUS },
  responses,
  operationId,
}) {
  // If `default` is used, any status code is allowed.
  if (responses.default !== undefined) {
    return status
  }

  // `validate.status` as an array
  const statuses = parseStatus({ status, property: 'task.validate.status' })
  // Specification statuses
  const responseStatuses = Object.keys(responses)
  // Only keep specification statuses from `validate.status`
  const statusesA = lodash.intersection(statuses, responseStatuses)

  validateEmptyStatus({
    statuses: statusesA,
    responseStatuses,
    status,
    operationId,
  })

  // Serialize back to same format as `validate.status` input
  const statusA = serializeStatus({ statuses: statusesA })
  return statusA
}

// The default value of `validate.status` is assigned later, so we need to
// assign it now
const DEFAULT_STATUS = '2xx'

// Can only specify `validate.status` of status codes described in specification
const validateEmptyStatus = function ({
  statuses,
  responseStatuses,
  status,
  operationId,
}) {
  if (statuses.length !== 0) {
    return
  }

  const expected = responseStatuses.map(Number)
  const responseStatusesStr = getWordsList(responseStatuses)
  throw new TestApiError(
    `Specification for '${operationId}' describes the following status codes: ${responseStatusesStr} but 'task.validate.status' only allows the following status codes: ${status}`,
    { props: { value: status, expected, property: 'task.validate.status' } },
  )
}

// If there is a `default` response, it becomes `validate.STATUSES` where
// `STATUSES` are all the other valid HTTP statuses.
const handleDefaultResponse = function ({ responseStatus, responses }) {
  if (responseStatus !== 'default') {
    return responseStatus
  }

  const responseStatuses = Object.keys(responses)
  const validStatuses = statusesLib.codes.map(String)
  const statuses = lodash.difference(validStatuses, responseStatuses)

  const key = serializeStatus({ statuses })
  return key
}
