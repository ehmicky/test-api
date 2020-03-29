import filterObj from 'filter-obj'
import { mapValues } from 'lodash'

import { TestApiError } from '../../errors/error.js'
import { get, tryGet } from '../../utils/get.js'

// `task.variables.$$NAME: '[PATH] [OPTS]'` allows using `$$NAME` in any task,
// to run the task that defined the variables, and retrieve a specific property
// at `PATH`
export const template = function ({ _allTasks: allTasks, _runTask: runTask }) {
  const variables = allTasks.map((taskA) =>
    getTaskVariables({ task: taskA, allTasks, runTask }),
  )
  const variablesA = Object.assign({}, ...variables)
  return variablesA
}

const getTaskVariables = function ({
  task: { key, variables },
  allTasks,
  runTask,
}) {
  if (variables === undefined) {
    return
  }

  const variablesA = filterObj(variables, isDefined)

  const taskVariables = mapValues(variablesA, (value) =>
    evalTask.bind(null, { key, value, allTasks, runTask }),
  )
  return taskVariables
}

const isDefined = function (key, value) {
  return value !== undefined
}

// Runs a task and returns `task[PATH]`
const evalTask = async function ({ key, value, allTasks, runTask }) {
  const taskA = await runVariableTask({ key, allTasks, runTask })

  const taskProp = getTaskProp({ task: taskA, value })
  return taskProp
}

// Runs the task
const runVariableTask = async function ({ key, allTasks, runTask }) {
  const taskA = allTasks.find((task) => task.key === key)

  const getError = getTaskError.bind(null, { task: taskA })
  const taskB = await runTask({ task: taskA, getError })
  return taskB
}

const getTaskError = function ({ task: { key } }) {
  return new TestApiError(`task '${key}' failed`)
}

// Retrieve task property
const getTaskProp = function ({ task, task: { key }, value }) {
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
    { value: valueA },
  )
}

// Parse '[PATH] [OPTS,...]'
const parseValue = function ({ value }) {
  const [path, options = ''] = value.split(/\s+/u)
  const optionsA = options.split(',').filter((option) => option !== '')

  return { path, options: optionsA }
}
