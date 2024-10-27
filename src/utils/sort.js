// Like array.sort() but does not mutate argument
export const sortArray = (array, func) => [...array].sort(func)
