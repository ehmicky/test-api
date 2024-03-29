import lodash from 'lodash'
import underscoreString from 'underscore.string'

import { removeColors } from '../../../utils/colors.js'

// Retrieve TAP error properties
export const getErrorProps = ({ ok, reportProps }) => {
  if (ok) {
    return
  }

  const reportPropsA = normalizeReportProps({ reportProps })

  // Enforce properties order
  const {
    message,
    operator,
    expected,
    actual,
    value,
    schema,
    property,
    ...rest
  } = reportPropsA

  return {
    message,
    operator,
    severity: 'fail',
    expected,
    actual,
    value,
    schema,
    property,
    ...rest,
  }
}

// `plugin.report()` is optimized for `pretty` reporter
// With TAP we want to:
//  - exclude core report properties, because we directly use `error.*` and
//    make sure they becomes valid/common TAP error properties
//  - newlines should be escaped, because of bugs with some TAP parsers
//  - only print them on errors, as successes should not have properties
//    according to TAP
//  - remove ANSI color sequences
//  - rename keys to underscore style
const normalizeReportProps = ({ reportProps }) => {
  const reportPropsA = lodash.mapValues(reportProps, normalizeReportPropValue)
  const reportPropsB = lodash.mapKeys(reportPropsA, normalizeReportPropKey)
  return reportPropsB
}

const normalizeReportPropValue = (value) => removeColors(value)

const normalizeReportPropKey = (value, name) => {
  const tapName = TAP_NAMES[name]

  if (tapName !== undefined) {
    return tapName
  }

  return underscoreString.underscored(name)
}

// Rename core properties names to names common in TAP output
const TAP_NAMES = {
  message: 'message',
  plugin: 'operator',
  reporter: 'operator',
  value: 'value',
  'expected value': 'expected',
  'actual value': 'actual',
  'JSON schema': 'schema',
  property: 'property',
}
