import lodash from 'lodash'

import { getPath } from '../../../utils/path.js'
import { isObject } from '../../../utils/types.js'
import { checkIsSchema } from '../../../validation/meta.js'

// Handler JSON schemas in `task.validate.headers|body`
export const handleJsonSchemas = ({ validate }) =>
  lodash.mapValues(validate, handleJsonSchema)

const handleJsonSchema = (value, prop) => {
  if (!hasJsonSchema({ prop })) {
    return value
  }

  if (!isObject(value)) {
    return applyShortcut({ value })
  }

  validateJsonSchema({ value, prop })

  return value
}

const hasJsonSchema = ({ prop }) =>
  prop.startsWith('headers.') || prop === 'body'

// `task.validate.headers|body: non-object` is shortcut for `{ enum: [value] }`
const applyShortcut = ({ value }) => {
  const type = guessType(value)
  return { ...type, enum: [value] }
}

// When using the shortcut notation, we need to set the `type` to make sure it
// matches the value (in case it is not set, or set to several types, or set to
// a different type)
const guessType = (value) => {
  if (value === undefined) {
    return
  }

  const [type] = TYPES.find(([, condition]) => condition(value))
  return { type }
}

const TYPES = Object.entries({
  null: (value) => value === null,
  integer: Number.isInteger,
  number: (value) => typeof value === 'number' && !Number.isInteger(value),
  string: (value) => typeof value === 'string',
  boolean: (value) => typeof value === 'boolean',
  array: Array.isArray,
  // Default
  object: () => true,
})

// Validate `task.validate.headers|body` are valid JSON schemas
const validateJsonSchema = ({ value, prop }) => {
  const valueProp = getPath(['task', 'validate', prop])
  checkIsSchema({ value, valueProp })
}
