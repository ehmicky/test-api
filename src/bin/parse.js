import { excludeKeys } from 'filter-obj'

export const parseConfig = ({ yargs }) => {
  const { _: tasks, ...config } = yargs.parse()

  const configA = excludeKeys(config, isInternalOpt)

  const tasksA = tasks.length === 0 ? undefined : tasks
  const configB = { ...configA, tasks: tasksA }
  return configB
}

// Remove `yargs`-specific options, shortcuts and dash-cased
const isInternalOpt = (key, value) =>
  value === undefined ||
  INTERNAL_KEYS.has(key) ||
  key.length === 1 ||
  key.includes('-')

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0'])
