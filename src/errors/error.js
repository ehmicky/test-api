import {
  ponyfillCause,
  ensureCorrectClass,
  setErrorName,
  sanitizeProperties,
} from 'error-class-utils'

import {
  isSimpleSchema,
  getSimpleSchemaConstant,
} from '../utils/simple_schema.js'
import { getWordsList } from '../utils/string.js'

// Error properties (all might not be present):
//  - `config` `{object}`: initial configuration object
//  - `plugins` `{string[]}`: list of loaded plugins
//  - `module` `{string}`: module that triggered the first error,
//     e.g. `plugin-PLUGIN` or `reporter-REPORTER`
//  - `bug` `{boolean}`: true if it was a bug
//  - `task` `{object}`: current task
//  - `property` `{string}`: path to the property in `task`, `config`, `plugin`
//    or `reporter`. Always starts with either of those.
//  - `value` `{value}`: errored value
//  - `expected` `{value}`: expected value
//  - `schema` `{object}`: JSON schema v4 matched against `value`
// When all errors were thrown during task running, and there were not bugs,
// all above properties will be `undefined` (except `config`) and the following
// will be defined:
//  - `errors` `{array}`: all errors.
//  - `tasks` `{array}`: all tasks.
/* eslint-disable fp/no-this */
const errorCustomClass = function (name) {
  const CustomErrorClass = class extends Error {
    constructor(message, parameters) {
      super(message, parameters)
      ensureCorrectClass(this, new.target)
      ponyfillCause(this, parameters)
      setErrorProps(this, parameters)
    }
  }
  setErrorName(CustomErrorClass, name)
  return CustomErrorClass
}
/* eslint-enable fp/no-this */

const setErrorProps = function (error, parameters) {
  const props = sanitizeProperties(parameters?.props)
  Object.keys(props).forEach(validateProperty)
  const expected = getExpected({ props })
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(error, { ...props, ...expected })
}

// Enforce which properties can be attached to `error.*`
const validateProperty = function (property) {
  if (VALID_PROPERTIES_SET.has(property)) {
    return
  }

  const validProperties = getWordsList(VALID_PROPERTIES, { op: 'and' })
  throw new BugError(
    `Error property '${property}' is invalid. The only valid error properties are: ${validProperties}`,
    { props: { value: property, expected: VALID_PROPERTIES } },
  )
}

const USER_VALID_PROPERTIES = ['property', 'value', 'expected', 'schema']
const CORE_VALID_PROPERTIES = [
  'config',
  'plugins',
  'module',
  'bug',
  'task',
  'tasks',
  'errors',
  'nested',
]
const VALID_PROPERTIES = [...USER_VALID_PROPERTIES, ...CORE_VALID_PROPERTIES]
const VALID_PROPERTIES_SET = new Set(VALID_PROPERTIES)

// Tries to guess `error.expected` from simple `error.schema`
const getExpected = function ({ props: { schema, expected } }) {
  if (expected !== undefined) {
    return { expected }
  }

  if (!isSimpleSchema(schema)) {
    return
  }

  const expectedA = getSimpleSchemaConstant(schema)
  return { expected: expectedA }
}

// A normal error
export const TestApiError = errorCustomClass('TestApiError')
// An error indicating a problem in the library or in a plugin.
// Note that any non `TestApiError` error is considered a bug.
// Using `BugError` allows being more explicit and assigning
// `error.*` properties.
export const BugError = errorCustomClass('BugError')
