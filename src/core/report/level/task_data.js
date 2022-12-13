import omit from 'omit.js'

import { isObject } from '../../../utils/types.js'

// Apply `config.report.REPORTER.level` to remove some `task.PLUGIN.*`
// Use `task.originalTask` but do not keep it
export const filterTaskData = ({
  task: { originalTask, ...task },
  options: {
    level: { taskData },
  },
  plugins,
}) =>
  plugins.reduce(
    (taskA, { name }) =>
      reduceTaskData({ task: taskA, originalTask, name, taskData }),
    task,
  )

const reduceTaskData = ({ task, originalTask, name, taskData }) => {
  if (task[name] === undefined) {
    return task
  }

  return TASK_DATA[taskData]({ task, originalTask, name })
}

const keepNone = ({ task, name }) => omit.default(task, [name])

const keepAdded = ({ task, originalTask, name }) => {
  if (originalTask[name] === undefined) {
    return task
  }

  if (!areObjects({ task, originalTask, name })) {
    return omit.default(task, [name])
  }

  const taskValue = removeOriginalTaskKeys({ task, originalTask, name })

  if (Object.keys(taskValue).length === 0) {
    return omit.default(task, [name])
  }

  return { ...task, [name]: taskValue }
}

const areObjects = ({ task, originalTask, name }) =>
  isObject(originalTask[name]) && isObject(task[name])

const removeOriginalTaskKeys = ({ task, originalTask, name }) => {
  const originalTaskKeys = Object.keys(originalTask[name])
  const taskValue = omit.default(task[name], originalTaskKeys)
  return taskValue
}

const TASK_DATA = {
  all: ({ task }) => task,
  none: keepNone,
  added: keepAdded,
}
