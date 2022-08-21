import underscoreString from 'underscore.string'

import { convertPlainObject } from '../errors/convert.js'
import { BugError } from '../errors/error.js'
import { getPath } from '../utils/path.js'

// If a value in `task.*` could not be serialized, we add it as `task.error`
// so it gets properly reported (as opposed to throwing an error)
export const addSerializeFail = function ({ task, error, plugins }) {
  if (error === undefined) {
    return task
  }

  const errorA = getSerializeFail({ error, plugins })
  const errorB = convertPlainObject(errorA)

  return { ...task, error: errorB }
}

const getSerializeFail = function ({
  error: { message, value, path },
  plugins,
}) {
  const messageA = underscoreString.capitalize(message)
  // Make sure `error.value` is serializable
  const valueA = String(value)
  const property = getPath(['task', ...path])
  const moduleProp = guessModule({ path, plugins })

  const error = new BugError(messageA, {
    props: { value: valueA, property, ...moduleProp },
  })
  return error
}

// Try to guess `error.module` from where the value was in task.*
// This is not error-proof since plugins can modify input of other plugins.
const guessModule = function ({ path: [name], plugins }) {
  const plugin = plugins.find(({ name: nameA }) => nameA === name)

  if (plugin === undefined) {
    return
  }

  return { module: `plugin-${name}` }
}
