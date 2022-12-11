// Repeat each task `config|task.repeat` times.
// It will be reported only as a single task.
// Run all tasks in parallel.
export const run = async (
  task,
  { _nestedPath: nestedPath, _runTask: runTask },
) => {
  if (nestedPath !== undefined) {
    return
  }

  const data = getData({ task })

  if (data.length === 1) {
    return
  }

  const tasks = data.map((datum, index) =>
    runRepeatedTask({ task, runTask, datum, index }),
  )
  // We only keep the first task. If any fails, the first error will be
  // propagated.
  const [taskA] = await Promise.all(tasks)

  // We interrupt next handlers since we already ran them
  return { ...taskA, done: true }
}

// Retrieve input `$$data` of each iteration
const getData = ({
  task: { repeat: { times = DEFAULT_TIMES, data = DEFAULT_DATA } = {} },
}) => Array.from({ length: times }, () => data).flat()

const DEFAULT_TIMES = 1
const DEFAULT_DATA = [undefined]

const runRepeatedTask = ({
  task: { template, ...task },
  runTask,
  datum,
  index,
}) => {
  const templateA = { $$data: datum, $$index: index, ...template }
  const taskA = { ...task, template: templateA }
  return runTask({ task: taskA, self: true })
}
