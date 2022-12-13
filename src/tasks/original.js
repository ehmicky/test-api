import omit from 'omit.js'

// Used to keep original task properties as is in return values and reporting
// Does not need to be done before this point, since only used by later
// handlers.
// Does not need to be done later, since `start` handlers cannot modify `tasks`
export const addOriginalTasks = ({ tasks }) =>
  tasks.map((task) => ({ ...task, originalTask: task }))

// `originalTask` is kept only for reporters, but should not be reported nor
// returned
export const removeOriginalTasks = ({ tasks }) =>
  tasks.map((task) => omit.default(task, ['originalTask']))
