import filterObj from 'filter-obj'
import lodash from 'lodash'
import omit from 'omit.js'

// Spec parameters are only generated if either:
//  - they are required
//  - the parameter is also specified in `task.call.*`
//    (including as `valid` or `invalid`)
// This works both top-level and for nested properties
export const removeOptionals = function ({ params, call }) {
  const paramsA = removeTopLevel({ params, call })
  const paramsB = removeNested({ params: paramsA, call })
  return paramsB
}

// Spec parameters are marked as required by using `optional: false` (default)
const removeTopLevel = function ({ params, call }) {
  const paramsA = filterObj(
    params,
    (key, param) => !isSkippedOptional({ param, key, call }),
  )
  const paramsB = lodash.mapValues(paramsA, removeOptionalProp)
  return paramsB
}

const isSkippedOptional = function ({ param: { optional }, key, call }) {
  return optional && call[key] === undefined
}

// Remove `optional` now that it's been used (it is not valid JSON schema)
const removeOptionalProp = function (param) {
  return omit.default(param, ['optional'])
}

// Spec nested properties are marked as required by using JSON schema `required`
const removeNested = function ({ params, call }) {
  return lodash.mapValues(params, (schema, key) =>
    removeNonRequired({ schema, definedProps: call[key] }),
  )
}

// Remove properties that are neither required nor specified in `definedProps`
const removeNonRequired = function ({
  schema: { properties, required = [], ...schema },
  definedProps = {},
}) {
  if (properties === undefined) {
    return schema
  }

  const propertiesA = filterObj(
    properties,
    (name) => required.includes(name) || definedProps[name] !== undefined,
  )

  const propertiesB = lodash.mapValues(propertiesA, (property, name) =>
    removeNonRequired({ schema: property, definedProps: definedProps[name] }),
  )

  return { ...schema, properties: propertiesB }
}
