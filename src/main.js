import { loadConfig } from './config/main.js'
import { handleFinalFailure } from './errors/final.js'
import { topLevelHandler } from './errors/top.js'
import { loadPlugins } from './plugins/load.js'
import { completeTask } from './run/complete.js'
import { endTasks } from './run/end.js'
import { loadTasks } from './run/load.js'
import { runTask } from './run/run.js'
import { startTasks } from './run/start.js'
import { getTasks } from './tasks/get.js'
// eslint-disable-next-line import/max-dependencies
import { removeOriginalTasks } from './tasks/original.js'

// Main entry point
// Does in order:
//  - load configuration
//  - load tasks
//  - load plugins
//  - run each `plugin.start()`
//  - for each task, in parallel:
//     - run each `plugin.run()`
//     - run each `plugin.complete()`
//  - run each `plugin.end()`
// Return tasks on success
// If any task failed, throw an error instead
export const run = async (config = {}) => {
  try {
    const configA = loadConfig({ config })

    const tasks = await getTasks({ config: configA })

    const plugins = await loadPlugins({ config: configA })

    const tasksA = await performRun({ config: configA, tasks, plugins })
    return tasksA
  } catch (error) {
    topLevelHandler(error, config)
  }
}

// Fire all plugin handlers for all tasks
const performRun = async ({ config, tasks, plugins }) => {
  try {
    const { tasks: tasksA, allTasks } = await loadTasks({
      config,
      tasks,
      plugins,
    })
    const context = { _tasks: tasksA, _allTasks: allTasks }

    const startData = await startTasks({ config, context, plugins })
    const contextA = { ...context, startData }

    const tasksB = await fireTasks({
      tasks: tasksA,
      context: contextA,
      plugins,
    })

    const tasksC = await finalizeTasks({
      tasks: tasksB,
      config,
      context: contextA,
      plugins,
    })

    return tasksC
    // Add `error.plugins` to every thrown error
  } catch (error) {
    error.plugins = plugins.map(({ name }) => name)
    throw error
  }
}

// Fire all tasks in parallel
const fireTasks = ({ tasks, context, plugins }) => {
  const tasksA = tasks.map((task) => fireTask({ task, context, plugins }))
  return Promise.all(tasksA)
}

const fireTask = async ({ task, context, plugins }) => {
  const taskA = await runTask({ task, context, plugins })

  const taskC = await completeTask({ task: taskA, context, plugins })

  return taskC
}

const finalizeTasks = async ({ tasks, config, context, plugins }) => {
  await endTasks({ tasks, config, context, plugins })

  const tasksA = removeOriginalTasks({ tasks })

  handleFinalFailure({ tasks: tasksA })

  return tasksA
}
