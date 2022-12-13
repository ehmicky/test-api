import { STATUS_REGEXP } from './status/parse.js'

// Make `validate.[STATUS.]headers.*` case-insensitive
// Also remove `undefined` validate values
export const normalizeValidate = ({ validate }) => normalizeObject(validate)

const normalizeObject = (object) => {
  const validateA = Object.entries(object).filter(isDefined).map(normalizeKeys)
  const validateB = Object.assign({}, ...validateA)
  return validateB
}

const isDefined = ([, value]) => value !== undefined

const normalizeKeys = ([name, value]) => {
  // Recurse over `validate.STATUS.*`
  if (STATUS_REGEXP.test(name)) {
    return { [name]: normalizeObject(value) }
  }

  if (!name.startsWith('headers.')) {
    return { [name]: value }
  }

  return { [name.toLowerCase()]: value }
}
