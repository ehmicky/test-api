import { excludeKeys, includeKeys } from 'filter-obj'

import { merge } from '../../../utils/merge.js'
import { getPath } from '../../../utils/path.js'

import { parseStatus, STATUS_REGEXP } from './status/parse.js'

// `validate.STATUS.*` is like `validate.*` but as map according to status code.
// STATUS can use ranges and comma-separated lists like `validate.status`
export const addByStatus = ({ validate, response }) => {
  const byStatus = includeKeys(validate, isByStatus)
  const validateA = excludeKeys(validate, isByStatus)

  const byStatusA = Object.entries(byStatus)
    .filter(([status]) => matchesResponse({ status, response }))
    .map(([, value]) => value)

  if (byStatusA.length === 0) {
    return validateA
  }

  // `validate.STATUS` has lower priority because of its use in `spec` plugin
  return merge(...byStatusA, validateA)
}

const isByStatus = (name) => STATUS_REGEXP.test(name)

const matchesResponse = ({ status, response }) => {
  const property = getPath(['task', 'validate', status])
  const statuses = parseStatus({ status, property })

  const matchesStatus = statuses.includes(String(response.status))
  return matchesStatus
}
