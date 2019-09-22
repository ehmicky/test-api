import { difference } from 'lodash'
import filterObj from 'filter-obj'

import { getModule } from '../../../modules.js'

import { COMMON_OPTIONS_SCHEMA } from './common_options_schema.js'
import { REPORTER_SCHEMA } from './reporter_schema.js'

// Get `startData.report.reporters`
export const getReporters = function({ config }) {
  const names = getNames({ config })

  const reporters = names.map(name => getModule(name, MODULE_OPTS))
  return reporters
}

// Reporters are specified by using their name in `config.report.REPORTER`
const getNames = function({ config: { report = {} } }) {
  const reportA = filterObj(report, isDefined)
  const names = Object.keys(reportA)
  const namesA = difference(names, Object.keys(COMMON_OPTIONS_SCHEMA))

  // When `config.report` is `undefined` or an empty object
  if (namesA.length === 0) {
    return DEFAULT_REPORTERS
  }

  return namesA
}

const isDefined = function(key, value) {
  return value !== undefined
}

const DEFAULT_REPORTERS = ['pretty']

const MODULE_OPTS = {
  title: 'reporter',
  modulePrefix: 'test-api-reporter-',
  corePath: `${__dirname}/../reporters/`,
  props: ({ name }) => ({ property: `config.report.${name}` }),
  schema: REPORTER_SCHEMA,
}
