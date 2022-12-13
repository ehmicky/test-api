import { env } from 'node:process'

import lodash from 'lodash'

import { parseFlat } from '../../../utils/flat.js'

// `$$env.envVarName` template function
// Replaced by `process.env.envVarName`
const getEnv = () => lodash.mapValues(env, parseFlat)

export const envHelper = getEnv()
