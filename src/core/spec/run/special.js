import { crawl } from '../../../utils/crawl.js'

// Handle values in `call.*` that have special meanings:
//  - `valid` means `same as OpenAPI definition`
//  - `invalid` means `inverse of OpenAPI definition`
// Those are crawled, extracted and removed from `call.*`
export const getSpecialValues = ({ call }) => {
  const specialValues = initSpecialValues()

  const callA = crawl(call, evalNode.bind(undefined, specialValues))

  return { call: callA, specialValues }
}

const initSpecialValues = () => {
  const specialValues = SPECIAL_VALUES.map((specialValue) => ({
    [specialValue]: [],
  }))
  return Object.assign({}, ...specialValues)
}

const evalNode = (specialValues, value, path) => {
  // Can escape special values with a backslash
  if (ESCAPED_VALUES.has(value)) {
    return value.replace(ESCAPING_CHAR, '')
  }

  // Not a special value: leave as is
  if (!SPECIAL_VALUES.has(value)) {
    return value
  }

  // Keep track of paths of special values
  // eslint-disable-next-line fp/no-mutating-methods
  specialValues[value].push(path)

  // Return `undefined`, i.e. remove this node, otherwise it would have priority
  // over `spec` params
}

const SPECIAL_VALUES_ARR = ['valid', 'invalid']
const SPECIAL_VALUES = new Set(SPECIAL_VALUES_ARR)
const ESCAPING_CHAR = '\\'
const ESCAPED_VALUES_ARR = SPECIAL_VALUES_ARR.map(
  (value) => `${ESCAPING_CHAR}${value}`,
)
const ESCAPED_VALUES = new Set(ESCAPED_VALUES_ARR)
