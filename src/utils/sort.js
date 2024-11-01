// Like array.sort() but does not mutate argument
// eslint-disable-next-line fp/no-mutating-methods
export const sortArray = (array, func) => [...array].sort(func)
