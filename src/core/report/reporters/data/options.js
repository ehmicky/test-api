import { startSpinner } from '../../utils/spinner.js'

// Add a CLI spinner updated with each complete task
export const options = ({ _tasks: tasks }) => {
  const spinner = startSpinner({ total: tasks.length })
  return { spinner }
}
