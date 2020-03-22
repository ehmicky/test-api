// Normalize `config.report.REPORTER.level`
// The reporting level should affect individual tasks reporting, not the summary
// `types` decides whether to show errors, successes, skipped tasks
// `taskData` decided whether to include task.PLUGIN.*
//    - `added` means only the added props (i.e. not in `task.config.task.*`)
export const normalizeLevel = function ({ options, reporter }) {
  const levelA = options.level || reporter.level || DEFAULT_LEVEL
  const levelB = LEVELS[levelA]
  return levelB
}

const DEFAULT_LEVEL = 'info'

const LEVELS = {
  silent: {
    types: new Set([]),
    taskData: 'none',
  },
  error: {
    types: new Set(['fail']),
    taskData: 'none',
  },
  warn: {
    types: new Set(['fail']),
    taskData: 'added',
  },
  info: {
    types: new Set(['fail', 'pass', 'skip']),
    taskData: 'added',
  },
  debug: {
    types: new Set(['fail', 'pass', 'skip']),
    taskData: 'all',
  },
}
