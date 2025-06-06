import omit from 'omit.js'

import { TestApiError } from '../../errors/error.js'
import { mergeWithTemplates } from '../../template/merge.js'
import { testRegExp } from '../../utils/regexp.js'

// Merge tasks whose name include RegExp matching other task names.
// I.e. special task name to allow for shared properties
// Also merge `config.merge` to all tasks: it is like the `merge` task `*`
// except it is set on `config` instead of as a task, making it possible for
// the user to specify on CLI.
export const load = (tasks, { config: { merge: mergeConfig } }) => {
  const { mergeTasks, nonMergeTasks } = splitTasks({ tasks })
  const tasksA = nonMergeTasks.map((task) =>
    mergeTask({ task, mergeTasks, mergeConfig }),
  )
  return tasksA
}

const splitTasks = ({ tasks }) => {
  const mergeTasks = tasks.filter(isMergeTask)
  const nonMergeTasks = tasks.filter((task) => !isMergeTask(task))
  return { mergeTasks, nonMergeTasks }
}

const isMergeTask = ({ merge }) => merge !== undefined

const mergeTask = ({ task, mergeTasks, mergeConfig = {} }) => {
  const mergeTasksA = findMergeTasks({ task, mergeTasks })

  if (mergeTasksA.length === 0) {
    return task
  }

  return mergeWithTemplates(mergeConfig, ...mergeTasksA, task)
}

const findMergeTasks = ({ task: { key, scope }, mergeTasks }) =>
  // eslint-disable-next-line fp/no-mutating-methods
  mergeTasks
    .filter(({ merge }) => testMergeRegExp(merge, key))
    .sort((taskA, taskB) => compareMergeTasks({ taskA, taskB, scope }))
    .map((task) => omit.default(task, NOT_MERGED_ATTRIBUTES))

const testMergeRegExp = (merge, key) => {
  try {
    return testRegExp(merge, key)
  } catch (error) {
    throw new TestApiError(
      `'task.merge' '${merge}' is invalid: ${error.message}`,
      { props: { value: merge, property: 'task.merge' } },
    )
  }
}

// Compute which `merge` tasks have priority over each other.
// Mostly depends on the scope it was loaded in with priority:
//   same scope > no scope > other scopes in alphabetical order
// Within the same scope, `merge` tasks declared last in keys order have
// priority.
// Note that we do not use `config.tasks` order as globbing expansion order is
// not stable.
// eslint-disable-next-line max-statements
const compareMergeTasks = ({
  taskA: { scope: scopeA },
  taskB: { scope: scopeB },
  scope,
}) => {
  // Inside the same scope, we use object keys order, i.e. `merge` tasks
  // declared last have priority.
  // Object keys order is not very reliable, so we must make sure `tasks` does
  // not change order since tasks loading.
  // Returning 0 will let `Array.sort()` rely on array order instead.
  if (scopeA === scopeB) {
    return 0
  }

  // `merge` tasks within the same scope have priority
  if (scopeA === scope) {
    return 1
  }

  if (scopeB === scope) {
    return -1
  }

  // `merge` tasks within no scope (i.e. passed directly as objects) come next
  if (scopeA === undefined) {
    return 1
  }

  if (scopeB === undefined) {
    return -1
  }

  // We then rely on task scope name alphabetical order.
  // Tasks whose scope is closer to z have higher priority.
  if (scopeA < scopeB) {
    return -1
  }

  return 1
}

const NOT_MERGED_ATTRIBUTES = ['key', 'scope', 'name', 'merge']
