import { checkArgument } from './check.js'
import { getDirective } from './directive.js'
import { getErrorProps } from './error_props.js'

// TAP assert
export const assert = (state, { ok, name = '', directive = {}, error }) => {
  const category = getCategory({ ok, directive })

  const index = updateState({ state, category })

  const okString = getOk({ ok })

  const nameString = getName({ name })

  const directiveString = getDirective({ directive })

  const errorProps = getErrorProps({ ok, error })

  return state.colors[category](
    `${okString} ${index}${nameString}${directiveString}${errorProps}\n\n`,
  )
}

const getCategory = ({ ok, directive: { skip } }) => {
  if (skip !== undefined && skip !== false) {
    return 'skip'
  }

  if (ok) {
    return 'pass'
  }

  return 'fail'
}

// Update index|tests|pass|skip|fail counters
const updateState = ({ state, category }) => {
  state[category] += 1

  state.index += 1
  return state.index
}

const getOk = ({ ok }) => {
  checkArgument(ok, 'boolean')

  if (ok) {
    return 'ok'
  }

  return 'not ok'
}

const getName = ({ name }) => {
  checkArgument(name, 'string')

  if (name === '') {
    return ''
  }

  return ` ${name}`
}
