import { groupBy } from 'lodash'
import { codes } from 'statuses'

// All possible HTTP status code as an array and as a
// `{ "1xx": [...], "2xx": [...], ... }` map
export const VALID_STATUSES = codes.map(String)

export const VALID_STATUSES_MAP = groupBy(
  VALID_STATUSES,
  (status) => `${status[0]}xx`,
)
