import lodash from 'lodash'

import { VALID_STATUSES_MAP } from './valid.js'

// `validate.status` can be `1xx`, `2xx`, `3xx`, `4xx` or `5xx`,
// case-insensitively
export const parseRanges = ({ statuses }) => {
  const statusesA = statuses.flatMap(parseRange)
  const statusesB = [...new Set(statusesA)]
  return statusesB
}

const parseRange = (status) => {
  if (!RANGE_REGEXP.test(status)) {
    return status
  }

  const statuses = VALID_STATUSES_MAP[status.toLowerCase()]
  return statuses
}

const RANGE_REGEXP = /^[1-5]xx$/iu

// Replace `100` + `101` + `102` by `1xx`, for any status code range
export const replaceByRanges = ({ statuses }) =>
  Object.entries(VALID_STATUSES_MAP).reduce(replaceByRange, statuses)

const replaceByRange = (statuses, [range, rangeStatuses]) => {
  const statusesA = lodash.difference(statuses, rangeStatuses)

  // Only if all possible status codes for that range are here
  if (statuses.length - statusesA.length !== rangeStatuses.length) {
    return statuses
  }

  return [range, ...statusesA]
}
