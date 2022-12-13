import { getProperty, setProperty } from 'dot-prop'

// Inverse OpenAPI params where `call.*: invalid` was used.
// If cannot find OpenAPI definition, set as an `anything` schema.
// TODO: json-schema-faker support for the `not` keyword is lacking
// E.g. `type` array is not supported, so `invalid value` actually does not
// work at the moment.
export const setInvalidParams = ({ params, specialValues: { invalid } }) =>
  invalid.reduce(reduceInvalidParam, params)

const reduceInvalidParam = (params, path) => {
  const param = getProperty(params, path)
  const invertedParam = param === undefined ? {} : { not: param }
  return setProperty(params, path, invertedParam)
}
