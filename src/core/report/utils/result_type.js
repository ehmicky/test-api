// Get whether a task failed, passed or was skipped
export const getResultType = ({ error, skipped }) => {
  if (error !== undefined) {
    return 'fail'
  }

  if (skipped) {
    return 'skip'
  }

  return 'pass'
}
