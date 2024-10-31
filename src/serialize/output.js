import { convertPlainObject } from '../errors/convert.js'
import { crawl } from '../utils/crawl.js'

import {
  ESCAPED_UNDEFINED,
  getMessage,
  isJsonType,
  UNDEFINED,
} from './common.js'
import { addSerializeFail } from './fail.js'

// Applied on tasks output, i.e. what is reported and returned
export const serializeOutput = ({ task, plugins }) => {
  // We use a `state` object because `crawl` utility does not allow returning
  // both the crawled object and extra information
  const state = {}

  const taskA = crawl(
    task,
    (value, path) => serializeOutputValue({ value, path, state }),
    {
      topDown: true,
    },
  )

  const { error } = state
  const taskB = addSerializeFail({ task: taskA, error, plugins })
  return taskB
}

// eslint-disable-next-line max-statements
const serializeOutputValue = ({ value, path, state }) => {
  if (value === undefined) {
    return UNDEFINED
  }

  if (value === UNDEFINED) {
    return ESCAPED_UNDEFINED
  }

  if (isJsonType(value)) {
    return value
  }

  if (typeof value === 'function') {
    return serializeFunction(value)
  }

  if (value instanceof Error) {
    return convertPlainObject(value)
  }

  // If the value cannot be serialized, returns the first one as `error`.
  // Serialize that value to `undefined`
  const message = getMessage({ value, path })
  state.error = { message, value, path }
}

const serializeFunction = ({ name }) => {
  const nameA = name || DEFAULT_FUNC_NAME
  return `function ${nameA}()`
}

const DEFAULT_FUNC_NAME = 'anonymous'
