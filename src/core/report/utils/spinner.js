import ora from 'ora'

// CLI spinner showing `INDEX/TOTAL` next to it (like a progress bar)
// Start the spinner
export const startSpinner = ({ index = -1, total }) => {
  const instance = ora(ORA_OPTS)

  const state = { index, total, instance }

  incrementSpinner(state)

  instance.start()

  return state
}

// Increment CLI spinner index
export const incrementSpinner = (state) => {
  // We need to mutate state because the spinner is shared by parallel tasks
  state.index += 1

  const { index, total, instance } = state
  // eslint-disable-next-line fp/no-mutation
  instance.text = `${index}/${total}`
}

// Temporarily hide the spinner, so that some output can be done without the
// spinner persisting in terminal
export const clearSpinner = ({ instance }) => {
  instance.clear()
}

// Remove the CLI spinner
export const stopSpinner = ({ instance }) => {
  instance.stop()
}

const ORA_OPTS = {
  spinner: 'dots12',
}
