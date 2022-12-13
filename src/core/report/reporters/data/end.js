import { isSilentTask } from '../../level/silent.js'
import { stopSpinner } from '../../utils/spinner.js'
import { getSummary } from '../../utils/summary.js'

// JSON reporter
export const end = (tasks, { options, options: { spinner } }) => {
  stopSpinner(spinner)

  const tasksA = getTasks({ tasks, options })
  const tasksB = JSON.stringify(tasksA, undefined, 2)
  return `${tasksB}\n`
}

const getTasks = ({ tasks, options }) => {
  const summary = getSummary({ tasks })
  const tasksA = tasks.filter((task) => !isSilentTask({ task, options }))

  return { summary, tasks: tasksA }
}
