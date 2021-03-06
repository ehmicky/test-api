import filterObj from 'filter-obj'
import { dump as yamlDump, DEFAULT_SCHEMA } from 'js-yaml'

import { indent } from '../../../utils/indent.js'

// YAML error properties for each failed assertion
export const getErrorProps = function ({ ok, error }) {
  if (ok || error === undefined) {
    return ''
  }

  const errorA = getError(error)

  const errorProps = serializeErrorProps({ error: errorA })
  return errorProps
}

const getError = function ({ message, name, stack, ...error }) {
  const at = getAt({ stack })

  const errorA = { message, operator: name, at, stack, ...error }
  const errorB = filterObj(errorA, isDefined)
  return errorB
}

const getAt = function ({ stack }) {
  if (stack === undefined) {
    return
  }

  const [, at] = stack.split('\n')
  return at.replace(AT_REGEXP, '')
}

// Remove leading '  at' from stack trace
const AT_REGEXP = /^.*at /u

const isDefined = function (key, value) {
  return value !== undefined
}

// Serialize error to indented YAML
const serializeErrorProps = function ({ error }) {
  const errorProps = yamlDump(error, YAML_OPTS)
  const errorPropsA = indent(errorProps)
  const errorPropsB = `\n  ---\n${errorPropsA}...`
  return errorPropsB
}

const YAML_OPTS = {
  schema: DEFAULT_SCHEMA,
  noRefs: true,
  // Otherwise `tap-out` parser crashes
  flowLevel: 1,
}
