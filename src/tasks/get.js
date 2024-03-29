import { TestApiError } from '../errors/error.js'
import { parseInput } from '../serialize/input.js'
import { getPath } from '../utils/path.js'

import { loadTasks } from './load.js'
import { validateTasksSyntax } from './validate/syntax.js'

// Retrieve tasks as an array of normalized task objects
export const getTasks = async ({ config: { tasks } }) => {
  const tasksA = await loadTasks({ tasks })

  validateTasksSyntax({ tasks: tasksA })

  const tasksB = parseTasks({ tasks: tasksA })
  return tasksB
}

// Validate tasks are JSON and turn `undefined` strings into actual `undefined`
const parseTasks = ({ tasks }) =>
  tasks.map((task) =>
    parseInput(task, throwParseError.bind(undefined, task.key)),
  )

const throwParseError = (key, { message, value, path }) => {
  const property = getPath(['task', ...path])
  throw new TestApiError(`Task '${key}' ${message}`, {
    props: { task: key, value, property },
  })
}
