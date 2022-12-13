import { includeKeys, excludeKeys } from 'filter-obj'
import lodash from 'lodash'

import { BugError, TestApiError } from '../../../errors/error.js'
import { numberToCardinal } from '../../../utils/cardinal.js'
import { getPath } from '../../../utils/path.js'
import { checkSchema } from '../../../validation/check.js'

// Wrap template helper functions with JSON schema validation from
// `plugin.config['template.*']`
export const wrapTemplateVars = ({ vars, plugin }) => {
  const templateConfig = getTemplateConfig({ plugin })

  const varsA = lodash.mapValues(templateConfig, (schema, name) =>
    wrapTemplateVar({ value: vars[name], name, schema, plugin }),
  )

  const varsB = excludeKeys(varsA, isUndefined)
  return { ...vars, ...varsB }
}

// Return `plugin.config['template.*']`
const getTemplateConfig = ({ plugin: { config } }) => {
  const templateConfig = includeKeys(config, (key) =>
    key.startsWith(TEMPLATE_CONFIG_PREFIX),
  )
  const templateConfigA = lodash.mapKeys(templateConfig, (value, key) =>
    key.replace(TEMPLATE_CONFIG_PREFIX, ''),
  )
  return templateConfigA
}

const TEMPLATE_CONFIG_PREFIX = 'template.'

// Wrap the template helper function
const wrapTemplateVar = ({ value, name, schema, plugin }) => {
  // Some template values might be optionally generated, so we ignore
  // `undefined`
  if (value === undefined) {
    return
  }

  const schemaProp = getPath(['plugin', 'config', `template.${name}`])

  validateTemplateConfig({ value, name, schemaProp, plugin })

  const valueA = templateVarWrapper.bind(undefined, { value, name, schema })
  return valueA
}

// Make sure it is a function before wrapping it
const validateTemplateConfig = ({ value, name, schemaProp, plugin }) => {
  if (typeof value === 'function') {
    return
  }

  throw new BugError(
    `'plugin.config["template.${name}"]' can only be defined if 'plugin.template.${name}' is a function`,
    { props: { value, property: schemaProp, module: `plugin-${plugin.name}` } },
  )
}

// Wrap `value(...args)` to first perform JSON validation
const templateVarWrapper = ({ value, name, schema }, ...args) => {
  const schemas = Array.isArray(schema) ? schema : [schema]

  schemas.forEach((schemaA, index) => {
    checkVar({ schema: schemaA, value: args[index], name, index })
  })

  return value(...args)
}

const checkVar = ({ schema, value, name, index }) => {
  const message = getMessage({ name, index })

  if (value === undefined) {
    return checkVarUndefined({ schema, message })
  }

  checkSchema({ schema, value, message })
}

const getMessage = ({ name, index }) => {
  const cardinal = numberToCardinal(index + 1)
  const message = `${cardinal} argument to '${name}'`
  return message
}

// Helper function arguments cannot be `undefined` unless
// `schema.x-optional: true`
const checkVarUndefined = ({
  schema: { 'x-optional': isOptional = false },
  message,
}) => {
  if (isOptional) {
    return
  }

  throw new TestApiError(`${message} must be defined`)
}

const isUndefined = (key, value) => value === undefined
