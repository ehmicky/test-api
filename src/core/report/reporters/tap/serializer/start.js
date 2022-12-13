import { plan } from './plan.js'
import { version } from './version.js'

// Start TAP output
export const start = ({ count, colors }) => {
  const versionString = version()

  const planString = plan({ count })

  return `${colors.version(versionString)}${colors.plan(planString)}`
}
