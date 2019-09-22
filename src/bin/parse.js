import filterObj from 'filter-obj'

export const parseConfig = function({ yargs }) {
  const { _: tasks, ...config } = yargs.parse()

  const configA = filterObj(config, isUserOpt)

  const tasksA = tasks.length === 0 ? undefined : tasks
  const configB = { ...configA, tasks: tasksA }
  return configB
}

// Remove `yargs`-specific options, shortcuts and dash-cased
const isUserOpt = function(key, value) {
  return (
    value !== undefined &&
    !INTERNAL_KEYS.includes(key) &&
    key.length !== 1 &&
    !key.includes('-')
  )
}

const INTERNAL_KEYS = ['help', 'version', '_', '$0']
