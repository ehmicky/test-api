import { promiseThen } from './promise.js'

// Like Array.reduce(), but supports async
export const reduceAsync = (
  array,
  mapFunc,
  { prevVal, secondMapFunc, stopFunc },
) => asyncReducer(prevVal, { array, mapFunc, secondMapFunc, stopFunc })

const asyncReducer = (prevVal, input) => {
  const { array, mapFunc, stopFunc, index = 0 } = input

  if (index === array.length) {
    return prevVal
  }

  if (stopFunc !== undefined && stopFunc(prevVal)) {
    return prevVal
  }

  const nextVal = mapFunc(prevVal, array[index], index, array)
  const inputA = { ...input, index: index + 1 }

  return promiseThen(nextVal, applySecondMap.bind(undefined, prevVal, inputA))
}

const applySecondMap = (prevVal, input, nextVal) => {
  if (input.secondMapFunc === undefined) {
    return asyncReducer(nextVal, input)
  }

  const nextValA = input.secondMapFunc(prevVal, nextVal)
  return asyncReducer(nextValA, input)
}
