import { crawl } from '../utils/crawl.js'

import {
  isJsonType,
  getMessage,
  UNDEFINED,
  ESCAPED_UNDEFINED,
} from './common.js'

// Applied on input config and tasks
export const parseInput = (taskOrConfig, throwError) =>
  crawl(
    taskOrConfig,
    (value, path) => parseInputValue({ value, path, throwError }),
    { topDown: true },
  )

const parseInputValue = ({ value, path, throwError }) => {
  if (value === UNDEFINED) {
    return
  }

  if (value === ESCAPED_UNDEFINED) {
    return UNDEFINED
  }

  if (isAllowed(value)) {
    return value
  }

  const message = getMessage({ value, path })
  throwError({ message, value, path })
}

const isAllowed = (value) =>
  isJsonType(value) || value === undefined || typeof value === 'function'
