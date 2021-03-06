// Is a plain object, including `Object.create(null)`
export const isObject = function (val) {
  return (
    val !== undefined &&
    val !== null &&
    (val.constructor === Object || val.constructor === undefined)
  )
}
