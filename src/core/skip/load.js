import { testRegExp } from '../../utils/regexp.js'
import { TestApiError } from '../../errors/error.js'

// `task.skip: anyValue` will skip those tasks
// Can also use `config.skip: 'RegExp' or ['RegExp', ...]`
export const load = function(tasks, { config: { skip: configSkip } }) {
  const tasksA = tasks.map(task => addSkipped({ task, configSkip }))
  return tasksA
}

const addSkipped = function({ task, task: { skip, key }, configSkip }) {
  if (!isSkipped({ skip, configSkip, key })) {
    return task
  }

  return { ...task, skipped: true }
}

// Any value in `task.skip` will be same as `true`. This is because templates
// are not evaluated yet, so we can't assume what the value is. But we still
// want the `skip` plugin to be performed before templating, as templating
// takes some time.
const isSkipped = function({ skip, configSkip, key }) {
  return (
    skip !== undefined ||
    (configSkip !== undefined && testSkipRegExp(configSkip, key))
  )
}

const testSkipRegExp = function(configSkip, key) {
  try {
    return testRegExp(configSkip, key)
  } catch (error) {
    throw new TestApiError(
      `'config.skip' '${configSkip}' is invalid: ${error.message}`,
      { value: configSkip, property: 'config.skip' },
    )
  }
}
