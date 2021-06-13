import lodash from 'lodash'
import statuses from 'statuses'

// All possible HTTP status code as an array and as a
// `{ "1xx": [...], "2xx": [...], ... }` map
export const VALID_STATUSES = statuses.codes.map(String)

export const VALID_STATUSES_MAP = lodash.groupBy(
  VALID_STATUSES,
  (status) => `${status[0]}xx`,
)
