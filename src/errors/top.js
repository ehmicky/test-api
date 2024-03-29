import { handleBugs } from './bug.js'

// Add `error.config` and `error.errors` to every error
// Also mark exceptions that are probably bugs as such
export const topLevelHandler = (error, config) => {
  error.config = config

  const errorA = handleBugs({ error })
  throw errorA
}
