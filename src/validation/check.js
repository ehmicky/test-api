import { excludeKeys } from 'filter-obj'

import { TestApiError, BugError } from '../errors/error.js'
import { crawl } from '../utils/crawl.js'
import { isObject } from '../utils/types.js'

import { validateFromSchema } from './validate.js'

// Validate against JSON schema and on failure throw error with
// `error.value|schema|property` set accordingly
// As opposed to `validateFromSchema()` which is meant to be separated in its
// own repository, this is meant only for this project.
export const checkSchema = ({ bug = false, value, ...opts }) => {
  const valueA = removeUndefined({ value })

  const error = validateFromSchema({ ...opts, value: valueA })

  if (error === undefined) {
    return
  }

  const ErrorType = bug ? BugError : TestApiError
  const { message } = error
  const props = getErrorProps({ opts, error })

  throw new ErrorType(message, { props })
}

// Values whose key is defined but whose value is `undefined` `opts.value` are
// mostly ignored by ajv except:
//  - if top-level `opts.value` itself is `undefined`
//  - `propertyNames`: this should be ok since it validates the key not
//    the value
//  - `minProperties|maxProperties|patternProperties|additionalProperties`:
//    this is problematic as `undefined` should behave as if the key was not
//    defined.
// I.e. we remove `undefined` values deeply
const removeUndefined = ({ value }) => crawl(value, removeUndefinedProp)

const removeUndefinedProp = (value) => {
  if (!isObject(value)) {
    return value
  }

  return excludeKeys(value, isUndefined)
}

const isUndefined = (key, value) => value === undefined

const getErrorProps = ({
  opts: { schemaProp, props },
  error: { value, schema, valuePath, schemaPath },
}) => {
  const property = getProperty({ schemaProp, valuePath, schemaPath })
  return { value, schema, ...property, ...props }
}

const getProperty = ({ schemaProp, valuePath, schemaPath }) => {
  const property = schemaProp === undefined ? valuePath : schemaPath

  if (property === '') {
    return
  }

  return { property }
}
