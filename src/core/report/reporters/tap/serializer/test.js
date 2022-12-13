import { assert } from './assert.js'
import { checkArgument } from './check.js'

// TAP test, i.e. group of asserts
export const test = (state, testName, asserts = []) => {
  checkArgument(testName, 'string')

  const testHeader = getTestHeader({ state, testName, asserts })

  const assertsString = asserts.map((assertOpts) => assert(state, assertOpts))

  const testString = [testHeader, ...assertsString].join('\n\n')
  return testString
}

const getTestHeader = ({ state: { colors }, testName, asserts }) => {
  const category = getCategory({ asserts })
  return colors[category](`# ${testName}`)
}

const getCategory = ({ asserts }) => {
  const failed = asserts.some(({ ok }) => !ok)

  if (failed) {
    return 'fail'
  }

  return 'pass'
}
