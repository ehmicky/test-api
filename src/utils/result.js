// Like Lodash result(), but works outside an object
export const result = (val, ...args) => {
  if (typeof val !== 'function') {
    return val
  }

  return val(...args)
}
