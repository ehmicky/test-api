import { getPath } from '../../../utils/path.js'
import { removePrefixes } from '../../../utils/prefix.js'
import { checkSchema } from '../../../validation/check.js'

import { checkRequired } from './required.js'

// Validates response headers
export const validateHeaders = ({ validate, response }) => {
  const validatedHeaders = removePrefixes(validate, 'headers')
  const headers = removePrefixes(response, 'headers')

  Object.entries(validatedHeaders).forEach(([name, schema]) => {
    validateHeader({ name, schema, headers })
  })
}

const validateHeader = ({ name, schema, headers }) => {
  const header = getResponseHeader({ headers, name })

  checkRequired({
    schema,
    value: header,
    property: getProperty(name),
    name: getName(name),
  })

  if (header === undefined) {
    return
  }

  // Validates response header against JSON schema from specification
  checkSchema({
    schema,
    value: header,
    schemaProp: getProperty(name),
    message: `${getName(name)} is invalid`,
  })
}

const getResponseHeader = ({ headers, name }) => {
  const nameB = Object.keys(headers).find((nameA) => nameA === name)

  if (nameB === undefined) {
    return
  }

  return headers[nameB]
}

const getProperty = (name) => getPath(['task', 'validate', `headers.${name}`])
const getName = (name) => `response header '${name}'`
