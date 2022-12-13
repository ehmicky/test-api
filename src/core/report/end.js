import { serializeOutput } from '../../serialize/output.js'

import { callReporters } from './call.js'
import { filterTaskData } from './level/task_data.js'

// Ends reporting
export const end = async (tasks, context) => {
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

const getArg = ({ tasks, plugins }, { options }) =>
  tasks.map((task) => filterTaskData({ task, options, plugins }))
