import { excludeKeys } from 'filter-obj'
import { DEFAULT_SCHEMA, dump as yamlDump } from 'js-yaml'

import { indent } from '../../../utils/indent.js'

// YAML error properties for each failed assertion
export const getErrorProps = ({ ok, error }) => {
  if (ok || error === undefined) {
    return ''
  }

  const errorA = getError(error)

  const errorProps = serializeErrorProps({ error: errorA })
  return errorProps
}

const getError = ({ message, name, stack, ...error }) => {
  const at = getAt({ stack })

  const errorA = { message, operator: name, at, stack, ...error }
  const errorB = excludeKeys(errorA, isUndefined)
  return errorB
}

const getAt = ({ stack }) => {
  if (stack === undefined) {
    return
  }

  const [, at] = stack.split('\n')
  return at.replace(AT_REGEXP, '')
}

// Remove leading '  at' from stack trace
const AT_REGEXP = /^.*at /u

const isUndefined = (key, value) => value === undefined

// Serialize error to indented YAML
const serializeErrorProps = ({ error }) => {
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
