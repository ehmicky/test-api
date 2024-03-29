import { excludeKeys } from 'filter-obj'

import { TestApiError } from '../errors/error.js'
import { parseInput } from '../serialize/input.js'
import { getPath } from '../utils/path.js'

import { validateConfig } from './validate.js'

// Load and normalize configuration
export const loadConfig = ({ config }) => {
  validateConfig({ config })

  const configA = parseInput(config, throwParseError)

  // Apply default values
  const configB = excludeKeys(configA, isUndefined)
  const configC = { ...DEFAULT_CONFIG, ...configB }

  return configC
}

// Validate configuration is JSON and turn `undefined` strings into
// actual `undefined`
const throwParseError = ({ message, value, path }) => {
  const property = getPath(['config', ...path])
  throw new TestApiError(`Configuration ${message}`, {
    props: { value, property },
  })
}

const isUndefined = (key, value) => value === undefined

const DEFAULT_CONFIG = {
  tasks: ['**/*.tasks.yml', '**/*.tasks.json'],
  plugins: [],
}
