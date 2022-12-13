// Similar to `await retVal` and `Promise.resolve(retVal).then()`
// As opposed to them, this does not create a new promise callback if the
// return value is synchronous, i.e. it avoids unnecessary new microtasks
export const promiseThen = (retVal, func) => {
  if (!isPromise(retVal)) {
    return func(retVal)
  }

  // eslint-disable-next-line promise/prefer-await-to-then
  return retVal.then(func)
}

// Similar to `await Promise.all([...retVals])` or
// `Promise.all([...retVals]).then()`
// As opposed to them, this does not create a new promise callback if the
// return value is synchronous, i.e. it avoids unnecessary new microtasks
export const promiseAllThen = (retVals, func) => {
  const retValsA = promiseAll(retVals)
  return promiseThen(retValsA, func)
}

export const promiseAll = (retVals) => {
  if (!retVals.some(isPromise)) {
    return retVals
  }

  return Promise.all(retVals)
}

const isPromise = (retVal) => retVal && typeof retVal.then === 'function'
