import filterObj from 'filter-obj'
import lodash from 'lodash'

import { isFormData, removeFormDataPrefix } from '../form_data.js'

// Merge `formData` parameters into a single `task.call.body` parameter
//   { type: 'object', properties: { one: { ... }, two: { ... } },
//     required: ['one'] }
// TODO: make `collectionFormat` work for `formData` parameters
export const normalizeFormData = function ({ params }) {
  const formDataParams = filterObj(params, isFormData)

  if (Object.keys(formDataParams).length === 0) {
    return params
  }

  const paramsA = formDataToBody({ formDataParams, params })
  return paramsA
}

const formDataToBody = function ({ formDataParams, params }) {
  const body = getBody({ formDataParams })
  const paramsA = filterObj(params, (key) => !isFormData(key))
  return { ...paramsA, body }
}

const getBody = function ({ formDataParams }) {
  const properties = lodash.mapKeys(formDataParams, (value, key) =>
    removeFormDataPrefix(key),
  )
  const required = getRequired({ properties })
  // OpenAPI 2.0 `formData` parameters can be individually made required, but
  // the specification does not prescribe whether the request body is required
  // or not.
  // So we assume it is.
  return { type: 'object', properties, required }
}

const getRequired = function ({ properties }) {
  return Object.entries(properties)
    .filter(([, { optional }]) => !optional)
    .map(([key]) => key)
}
