import deepMerge from 'deepmerge'

// We need a deep merge utility that:
//  - shallow merges arrays, i.e. `{ a: [1] }` + `{ a: [2] }` = `{ a: [2] }`
//  - do not skip `undefined`, i.e. `{ a: 1 }` + `{ a: undefined }` =
//   `{ a: undefined }`
//  - allow for customization, i.e. templates not being deep merged
export const merge = (...objects) => deepMerge.all(objects, { arrayMerge })

// Allow customizing merge by adding a `func`
export const customMerge = (isMergeableObject, ...objects) =>
  deepMerge.all(objects, { arrayMerge, isMergeableObject })

// Shallow merge array
const arrayMerge = (src, dest) => dest
