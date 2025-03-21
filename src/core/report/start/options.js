import { excludeKeys, includeKeys } from 'filter-obj'

import { checkSchema } from '../../../validation/check.js'
import { normalizeLevel } from '../level/normalize.js'
import { isSilent } from '../level/silent.js'

import { COMMON_OPTIONS_SCHEMA } from './common_options_schema.js'
import { normalizeOutput } from './output.js'

// Add `config.report.REPORTER.*` as `reporter.options`
export const addOptions = async ({ reporters, config, context }) => {
  const promises = reporters.map((reporter) =>
    addReporterOptions({ reporter, config, context }),
  )
  const reportersA = await Promise.all(promises)

  const reportersB = reportersA.filter((reporter) => reporter !== undefined)
  return reportersB
}

const addReporterOptions = async ({ reporter, config, context }) => {
  const options = getOptions({ reporter, config })

  validateOptions({ reporter, options })

  const optionsA = await normalizeOptions({ options, reporter })

  // Filter out reporters with `config.report.REPORTER.level` `silent`
  if (isSilent({ options: optionsA })) {
    return
  }

  const optionsB = transformOptions({ reporter, options: optionsA, context })

  return { ...reporter, options: optionsB }
}

// Retrieve `config.report.REPORTER.*`
const getOptions = ({
  reporter: { name },
  config: { report = {}, report: { [name]: options = {} } = {} },
}) => {
  // Can use `config.report.level|output` to set those for any reporter
  const globalOptions = includeKeys(report, Object.keys(COMMON_OPTIONS_SCHEMA))

  // Can use `true`, to make it CLI options-friendly
  if (options === true) {
    return globalOptions
  }

  const optionsA = excludeKeys(options, isUndefined)
  return { ...globalOptions, ...optionsA }
}

const isUndefined = (key, value) => value === undefined

// Validate `config.report.REPORTER.*` against `reporter.config`
const validateOptions = ({ reporter, reporter: { name }, options }) => {
  const schema = getOptionsSchema({ reporter })

  checkSchema({
    schema,
    value: options,
    valueProp: `config.report.${name}`,
    message: `Configuration for '${name}' reporter is invalid`,
    props: { module: `reporter-${name}` },
  })
}

const getOptionsSchema = ({ reporter: { config } }) => {
  const properties = { ...COMMON_OPTIONS_SCHEMA, ...config }
  return { type: 'object', properties, additionalProperties: false }
}

// Normalize `config.report.REPORTER.level|output` and set to
// `reporter.options.level|output`
const normalizeOptions = async ({ options, reporter }) => {
  const level = normalizeLevel({ options, reporter })

  const output = await normalizeOutput({ options, reporter })

  return { ...options, level, output }
}

// Transform options using `reporter.options()`
// This can only add new options not transform existing ones.
// In particular, it cannot change `level|output` as `level` needs to be used
// before this point (when checking whether level is `silent`)
const transformOptions = ({
  reporter: { options: reporterOptions },
  options,
  context,
}) => {
  if (reporterOptions === undefined) {
    return options
  }

  const optionsA = reporterOptions({ ...context, options })
  return { ...optionsA, ...options }
}
