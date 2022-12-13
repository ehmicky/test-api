import { inspect } from 'node:util'

import { emphasize } from 'emphasize'

import { truncate } from './truncate.js'

// Serialize, colorize, prettify and truncate a value
export const stringify = (value, { highlight = false } = {}) => {
  if (typeof value === 'string') {
    return prettifyString(value, { highlight })
  }

  return prettifyOthers(value)
}

const prettifyString = (string, { highlight }) => {
  // We truncate right away to speed-up syntax highlighting
  const stringA = truncate(string)
  const stringB = highlightString(stringA, { highlight })
  return stringB
}

const highlightString = (string, { highlight }) => {
  if (!highlight) {
    return string
  }

  // Automatic syntax highlighting according to MIME type/format
  return emphasize.highlightAuto(string).value
}

const prettifyOthers = (value) => {
  const string = inspect(value, INSPECT_OPTS)
  const stringA = truncate(string)
  const stringB = stringA.includes('\n') ? `\n${stringA}` : stringA
  return stringB
}

const INSPECT_OPTS = {
  colors: true,
  depth: 2,
  maxArrayLength: 10,
  getters: true,
}
