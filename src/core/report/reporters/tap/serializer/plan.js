import { checkArgument } from './check.js'
import { getDirective } from './directive.js'

// TAP plan
export const plan = ({ count }) => {
  if (count === undefined) {
    return ''
  }

  checkArgument(count, 'integer')

  const planString = getPlanString({ count })

  return `${planString}\n\n`
}

export const getPlanString = ({ count }) => {
  const planString = getPlan({ count })

  const directiveString = getPlanDirective({ count })

  return `${planString}${directiveString}`
}

const getPlan = ({ count }) => {
  if (count === 0) {
    // Needed notation for `tap-parser` to parse it correctly
    return '1..0'
  }

  return `1..${String(count)}`
}

// If no asserts are defined, consider plan as skipped
const getPlanDirective = ({ count }) => {
  if (count !== 0) {
    return ''
  }

  const directive = { skip: true }
  const directiveString = getDirective({ directive })
  return directiveString
}
