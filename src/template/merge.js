import isMergeableObject from 'is-mergeable-object'

import { customMerge } from '../utils/merge.js'

import { isTemplate } from './parse.js'

// Deep merge that never merges templates deeply
export const mergeWithTemplates = (...objects) =>
  customMerge(mergeWithTemplate, ...objects)

const mergeWithTemplate = (value) =>
  !isTemplate(value) && isMergeableObject(value)
