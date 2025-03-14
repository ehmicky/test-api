/* eslint-disable max-lines */
import Ajv from 'ajv'
import { excludeKeys } from 'filter-obj'
import lodash from 'lodash'
import moize from 'moize'
import underscoreString from 'underscore.string'

import { jsonPointerToParts } from '../utils/json_pointer.js'
import { getPath } from '../utils/path.js'

import { defaultInstance } from './instance.js'

// Wrapper around AJV validate() that augments its error return value:
//  - error.message: better error message.
//    Can be prefixed by `arg.message`
//  - error.value|schema: specific property within value|schema that triggered
//    the error
//  - error.valuePath|schemaPath: path to error.value|schema.
//    Can be prefixed by `arg.valueProp|schemaProp`
const validateFromSchema = ({
  schema,
  value,
  valueProp,
  schemaProp,
  message,
  instance = defaultInstance,
}) => {
  const passed = instance.validate(schema, value)

  if (passed) {
    return
  }

  const [error] = instance.errors

  const errorA = getError({
    error,
    schema,
    value,
    schemaProp,
    valueProp,
    message,
  })
  return errorA
}

const getError = ({ error, schema, value, schemaProp, valueProp, message }) => {
  const messageA = getMessage({ error, message, valueProp })

  const errorPath = getErrorPath({ error })
  const valueA = getValue({ errorPath, value })
  const valuePath = getValuePath({ errorPath, valueProp })

  const schemaParts = getSchemaParts({ error })
  const schemaA = getSchema({ schemaParts, schema })
  const schemaPath = getSchemaPath({ schemaParts, schemaProp })

  const errorA = {
    message: messageA,
    value: valueA,
    schema: schemaA,
    valuePath,
    schemaPath,
  }
  const errorB = excludeKeys(errorA, isUndefined)
  return errorB
}

const getMessage = ({ error, message, valueProp }) => {
  const messagePrefix = getMessagePrefix({ message, valueProp })
  const errorMessage = Ajv.prototype
    .errorsText([error], { dataVar: '' })
    .replace(FIRST_CHAR_REGEXP, '')
  return `${messagePrefix}: ${errorMessage}`
}

const FIRST_CHAR_REGEXP = /^[. ]/u

const getMessagePrefix = ({ message, valueProp }) => {
  if (message !== undefined) {
    return underscoreString.capitalize(message)
  }

  if (valueProp !== undefined) {
    return `'${valueProp}' is invalid`
  }

  return 'Value is invalid'
}

// `error.dataPath` is properly escaped, e.g. can be `.NAME`, `[INDEX]` or
// `["NAME"]` for names that need to be escaped.
// However it starts with a dot, which we strip.
const getErrorPath = ({ error: { dataPath } }) =>
  dataPath.replace(FIRST_DOT_REGEXP, '')

const FIRST_DOT_REGEXP = /^\./u

const getValue = ({ errorPath, value }) => {
  if (errorPath === '') {
    return value
  }

  return lodash.get(value, errorPath)
}

const getValuePath = ({ errorPath, valueProp }) =>
  concatProp(valueProp, errorPath)

const getSchemaParts = ({ error: { schemaPath } }) =>
  jsonPointerToParts(schemaPath)

const getSchema = ({ schemaParts, schema }) => {
  const key = schemaParts.at(-1)
  const value = lodash.get(schema, schemaParts)
  return { [key]: value }
}

const getSchemaPath = ({ schemaParts, schemaProp }) => {
  const schemaPath = getPath(schemaParts)
  const schemaPathA = concatProp(schemaProp, schemaPath)
  return schemaPathA
}

const concatProp = (prop, path) => {
  if (prop === undefined) {
    return path
  }

  if (path === '') {
    return prop
  }

  if (path.startsWith('[')) {
    return `${prop}${path}`
  }

  return `${prop}.${path}`
}

const isUndefined = (key, value) => value === undefined

// Compilation is automatically memoized by `ajv` but not validation
const mValidateFromSchema = moize(validateFromSchema, {
  isDeepEqual: true,
  maxSize: 1e4,
})
export { mValidateFromSchema as validateFromSchema }
/* eslint-enable max-lines */
