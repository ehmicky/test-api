import { TestApiError } from '../../../../errors/error.js'

import { normalizeStatuses } from './normalize.js'
import { parseStatus } from './parse.js'

// Validates response status code
export const validateStatus = ({
  validate: { status: vStatus = DEFAULT_STATUS },
  response: { status },
}) => {
  const vStatuses = parseStatus({ status: vStatus, property: PROPERTY })

  if (vStatuses.includes(String(status))) {
    return
  }

  const { value: expected, statusesStr } = normalizeStatuses(vStatuses)
  throw new TestApiError(
    `Status code was expected to be ${statusesStr}, but got ${status}`,
    { props: { value: status, expected, property: PROPERTY } },
  )
}

const DEFAULT_STATUS = '2xx'
const PROPERTY = 'task.validate.status'
