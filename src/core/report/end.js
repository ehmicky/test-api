import { serializeOutput } from '../../serialize/output.js'

import { callReporters } from './call.js'
import { filterTaskData } from './level/task_data.js'

// Ends reporting
export const end = async function (tasks, context) {
  const {
    startData: {
      report: { reporters },
    },
    _plugins: plugins,
  } = context

  const tasksA = tasks.map((task) => serializeOutput({ task, plugins }))

  const arg = getArg.bind(undefined, { tasks: tasksA, plugins })

  await callReporters({ reporters, type: 'end' }, arg, context)
}

const getArg = function ({ tasks, plugins }, { options }) {
  return tasks.map((task) => filterTaskData({ task, options, plugins }))
}
