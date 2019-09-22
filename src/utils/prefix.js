import { mapKeys } from 'lodash'
import filterObj from 'filter-obj'

// Handle special dot notation `task['headers.NAME']`,
// `task['query.NAME']`, etc.
// Returned as object
export const removePrefixes = function(object, prefix) {
  const objectA = filterObj(object, name => name.startsWith(prefix))
  const objectB = mapKeys(objectA, (value, name) =>
    name.replace(`${prefix}.`, ''),
  )
  return objectB
}
