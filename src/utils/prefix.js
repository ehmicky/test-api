import { includeKeys } from 'filter-obj'
import lodash from 'lodash'

// Handle special dot notation `task['headers.NAME']`,
// `task['query.NAME']`, etc.
// Returned as object
export const removePrefixes = function (object, prefix) {
  const objectA = includeKeys(object, (name) => name.startsWith(prefix))
  const objectB = lodash.mapKeys(objectA, (value, name) =>
    name.replace(`${prefix}.`, ''),
  )
  return objectB
}
