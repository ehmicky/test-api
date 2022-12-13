import { excludeKeys } from 'filter-obj'
import lodash from 'lodash'

import { TestApiError } from '../../errors/error.js'
import { get, tryGet } from '../../utils/get.js'

// `task.variables.$$NAME: '[PATH] [OPTS]'` allows using `$$NAME` in any task,
// to run the task that defined the variables, and retrieve a specific property
// at `PATH`
export const template = ({ _allTasks: allTasks, _runTask: runTask }) => {
  const variables = allTasks.map((taskA) =>
    getTaskVariables({ task: taskA, allTasks, runTask }),
  )
  const variablesA = Object.assign({}, ...variables)
  return variablesA
}

const getTaskVariables = ({ task: { key, variables }, allTasks, runTask }) => {
  if (variables === undefined) {
    return
  }

  const variablesA = excludeKeys(variables, isUndefined)

  const taskVariables = lodash.mapValues(variablesA, (value) =>
    evalTask.bind(undefined, { key, value, allTasks, runTask }),
  )
  return taskVariables
}

const isUndefined = (key, value) => value === undefined

// Runs a task and returns `task[PATH]`
const evalTask = async ({ key, value, allTasks, runTask }) => {
  const taskA = await runVariableTask({ key, allTasks, runTask })

  const taskProp = getTaskProp({ task: taskA, value })
  return taskProp
}

// Runs the task
const runVariableTask = async ({ key, allTasks, runTask }) => {
  const taskA = allTasks.find((task) => task.key === key)

  const getError = getTaskError.bind(undefined, { task: taskA })
  const taskB = await runTask({ task: taskA, getError })
  return taskB
}

const getTaskError = ({ task: { key } }) =>
  new TestApiError(`task '${key}' failed`)

// Retrieve task property
const getTaskProp = ({ task, task: { key }, value }) => {
  const { path, options } = parseValue({ value })

  if (path === undefined) {
    return task
  }

  const taskProp = get(task, path)

  if (taskProp !== undefined || options.includes('optional')) {
    return taskProp
  }

  const { wrongPath, value: valueA } = tryGet(task, path)
  throw new TestApiError(
    `task '${key}' did not return any property '${wrongPath}'`,
    { props: { value: valueA } },
  )
}

// Parse '[PATH] [OPTS,...]'
const parseValue = ({ value }) => {
  const [path, options = ''] = value.split(/\s+/u)
  const optionsA = options.split(',').filter((option) => option !== '')

  return { path, options: optionsA }
}
