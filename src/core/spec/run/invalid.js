import dotProp from 'dot-prop'

// Inverse OpenAPI params where `call.*: invalid` was used
export const setInvalidParams = function ({
  params,
  specialValues: { invalid },
}) {
  return invalid.reduce(reduceInvalidParam, params)
}

const reduceInvalidParam = function (params, path) {
  // Retrieve current OpenAPI definition
  const param = dotProp.get(params, path)

  // Then inverse it
  const paramA = getInvalidParam({ param })

  // And set it back
  return dotProp.set(params, path, paramA)
}

const getInvalidParam = function ({ param }) {
  // If cannot find OpenAPI definition, set as an `anything` schema
  if (param === undefined) {
    return {}
  }

  // TODO: json-schema-faker support for the `not` keyword is lacking
  // E.g. `type` array is not supported, so `invalid value` actually does not
  // work at the moment.
  return { not: param }
}
