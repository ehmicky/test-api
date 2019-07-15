import { TestApiError } from '../../errors/error.js'
import { testRegExp } from '../../utils/regexp.js'

// `config.only: 'RegExp' or ['RegExp', ...]` will only run tasks whose
// name matches.
// `task.only: anyValue` will only run those tasks
export const load = function(tasks, { config: { only: configOnly } }) {
  // Check if `config|task.only` is used, so we know whether to perform an
  // `only` run
  const enabled =
    configOnly !== undefined || tasks.some(({ only }) => only !== undefined)

  if (!enabled) {
    return
  }

  const tasksA = tasks.map(task => addExcluded({ task, configOnly }))
  return tasksA
}

const addExcluded = function({ task, task: { only, key }, configOnly }) {
  if (isOnly({ only, configOnly, key })) {
    return task
  }

  // As opposed to `skip` plugin, we need to set `excluded` not `skipped`
  return { ...task, excluded: true }
}

// Any value in `task.only` will be same as `true`. See `skip` plugin for
// explanation.
const isOnly = function({ only, configOnly, key }) {
  return (
    only !== undefined ||
    (configOnly !== undefined && testOnlyRegExp(configOnly, key))
  )
}

const testOnlyRegExp = function(configOnly, key) {
  try {
    return testRegExp(configOnly, key)
  } catch (error) {
    throw new TestApiError(
      `'config.only' '${configOnly}' is invalid: ${error.message}`,
      { value: configOnly, property: 'config.only' },
    )
  }
}
