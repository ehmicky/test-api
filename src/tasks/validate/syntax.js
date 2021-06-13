import omit from 'omit.js'

import { TestApiError } from '../../errors/error.js'

// Validate syntax of task files
export const validateTasksSyntax = function ({ tasks }) {
  if (tasks.length === 0) {
    throw new TestApiError('No tasks were found')
  }

  tasks.forEach(validateTaskSyntax)

  validateDuplicateKeys({ tasks })
}

const validateTaskSyntax = function (task) {
  const syntaxTest = SYNTAX_TESTS.find(({ test }) => test(task))

  if (syntaxTest === undefined) {
    return
  }

  const taskA = omit.default(task, ['key'])
  const taskB = JSON.stringify(taskA, undefined, 2)
  throw new TestApiError(
    `${syntaxTest.message} in the following task:\n${taskB}`,
  )
}

const SYNTAX_TESTS = [
  {
    test: ({ name }) => name === undefined || name === '',
    message: "'name' must be defined",
  },
  {
    test: ({ name }) => typeof name !== 'string',
    message: "'name' must be a string",
  },
  {
    test: ({ name }) => name.includes('/'),
    message: "'name' must not contain any slash",
  },
  {
    test: ({ scope }) => scope === '',
    message: "'scope' must not be an empty string",
  },
  {
    test: ({ scope }) => scope !== undefined && typeof scope !== 'string',
    message: "'scope' must be either undefined or a string",
  },
  {
    test: ({ scope }) => typeof scope === 'string' && scope.includes('/'),
    message: "'scope' must not contain any slash",
  },
]

// `task.key` must be unique
const validateDuplicateKeys = function ({ tasks }) {
  tasks.forEach(validateDuplicateKey)
}

const validateDuplicateKey = function ({ key, scope, name }, index, tasks) {
  const tasksA = tasks.slice(index + 1)
  const isDuplicate = tasksA.some(({ key: keyA }) => key === keyA)

  if (!isDuplicate) {
    return
  }

  throw new TestApiError(
    `Two tasks in the same 'scope' '${scope}' have the same 'name' '${name}'`,
  )
}
