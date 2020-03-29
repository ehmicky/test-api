import filterObj from 'filter-obj'

import { TestApiError } from '../errors/error.js'
import { parseInput } from '../serialize/input.js'
import { getPath } from '../utils/path.js'

import { validateConfig } from './validate.js'

// Load and normalize configuration
export const loadConfig = function ({ config }) {
  validateConfig({ config })

  const configA = parseInput(config, throwParseError)

  // Apply default values
  const configB = filterObj(configA, isDefined)
  const configC = { ...DEFAULT_CONFIG, ...configB }

  return configC
}

// Validate configuration is JSON and turn `undefined` strings into
// actual `undefined`
const throwParseError = function ({ message, value, path }) {
  const property = getPath(['config', ...path])
  throw new TestApiError(`Configuration ${message}`, { value, property })
}

const isDefined = function (key, value) {
  return value !== undefined
}

const DEFAULT_CONFIG = {
  tasks: ['**/*.tasks.yml', '**/*.tasks.json'],
  plugins: [],
}
