import lodash from 'lodash'

import { TestApiError } from '../../../../errors/error.js'
import { sortArray } from '../../../../utils/sort.js'

import { normalizeStatuses } from './normalize.js'
import { parseRanges, replaceByRanges } from './range.js'
import { VALID_STATUSES } from './valid.js'

// Parse `validate.status` into an array of possible statuses
export const parseStatus = ({ status, property }) => {
  // `validate.status` can be an integer because it's simpler when writing in
  // YAML (does not require quotes)
  const statusA = String(status)

  // `validate.status` can a space-delimited list of statuses
  const statuses = statusA.split(/\s+/u)

  const statusesA = [...new Set(statuses)]

  const statusesB = parseRanges({ statuses: statusesA })

  checkValidStatuses({ statuses: statusesB, property })

  return statusesB
}

const checkValidStatuses = ({ statuses, property }) => {
  const invalidStatuses = lodash.difference(statuses, VALID_STATUSES)

  if (invalidStatuses.length === 0) {
    return
  }

  const { value, statusesStr } = normalizeStatuses(invalidStatuses)
  const expected = VALID_STATUSES.map(Number)
  throw new TestApiError(
    `The task definition is invalid: those are not valid HTTP status codes: ${statusesStr}`,
    { props: { value, expected, property } },
  )
}

// Inverse of `parseStatus`
export const serializeStatus = ({ statuses }) => {
  const statusesA = replaceByRanges({ statuses })
  const statusesB = sortArray(statusesA)
  const statusKey = statusesB.join(' ')
  return statusKey
}

// Status code like `102` or status range like `2xx`
export const STATUS_REGEXP = /^[1-5][\dx]{2}/iu
