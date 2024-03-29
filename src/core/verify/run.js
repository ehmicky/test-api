import { verifyTask } from '../../plugins/verify.js'

// Validate plugin-specific configuration
// Must be done after templating.
export const run = (task, { _plugins: plugins }) => {
  plugins.forEach((plugin) => {
    verifyTask({ task, plugin })
  })
}
