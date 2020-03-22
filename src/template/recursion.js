import { isEqual } from 'lodash'

import { TestApiError } from '../errors/error.js'

// Since templates can return other templates which then get evaluated, we need
// to check for infinite recursions.
export const checkRecursion = function ({
  template,
  opts,
  opts: { recursive, stack = [] },
}) {
  const hasRecursion = stack.some((templateA) => isEqual(template, templateA))

  const stackA = [...stack, template]

  if (!hasRecursion) {
    const recursiveA = recursive.bind(null, stackA)
    return { ...opts, recursive: recursiveA }
  }

  const recursion = printRecursion({ stack: stackA })
  throw new TestApiError(`Infinite recursion:\n   ${recursion}`)
}

// Pretty printing of the recursion stack
const printRecursion = function ({ stack }) {
  return stack.map(printTemplate).join(`\n ${RIGHT_ARROW} `)
}

const printTemplate = function ({ type, name, arg }) {
  if (type === 'function') {
    return `${name}: ${JSON.stringify(arg)}`
  }

  return name
}

const RIGHT_ARROW = '\u21AA'
