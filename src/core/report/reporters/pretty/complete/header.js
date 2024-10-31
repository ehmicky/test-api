import cliTruncate from 'cli-truncate'

import { inverse, red } from '../../../utils/colors.js'
import { indent } from '../../../utils/indent.js'
import {
  FULL_LOWER_LINE,
  FULL_UPPER_LINE,
  HORIZONTAL_LINE,
  LINE_SIZE,
} from '../../../utils/line.js'
import { COLORS, MARKS } from '../constants.js'

// Header of the the message, with:
//  - a symbol indicating whether the task passed, failed or was skipped
//  - the task key
//  - the `titles` (as returned by `plugin.report()`)
export const getHeader = ({ task, task: { isNested }, titles, resultType }) => {
  const subKeys = getSubKeys({ titles })

  if (isNested) {
    return getNestedHeader({ task, subKeys })
  }

  return getFullHeader({ task, subKeys, resultType })
}

// Show all `titles` from `plugin.report()`
const getSubKeys = ({ titles }) => {
  const titlesA = titles.join('\n')
  const subKey = getSubKey(titlesA)
  return subKey
}

const getSubKey = (string) => {
  const stringA = string.trim()

  if (stringA === '') {
    return ''
  }

  return `\n\n${indent(stringA)}`
}

// Header for nested tasks
const getNestedHeader = ({ task: { key }, subKeys }) => {
  const content = `${indent(`Nested task: ${key}`)}${subKeys}`

  const contentA = fitContent({ content })

  const header = red(`${HORIZONTAL_LINE}\n${contentA}\n${HORIZONTAL_LINE}`)
  return header
}

const getFullHeader = ({ task: { key }, subKeys, resultType }) => {
  const content = ` ${MARKS[resultType]}  ${key}${subKeys}`

  const contentA = fitContent({ content })

  const header = `${FULL_LOWER_LINE}\n${inverse(contentA)}\n${FULL_UPPER_LINE}`
  const headerA = COLORS[resultType].bold(header)
  return headerA
}

// If the line is too long, truncate it
// If the line is too short, pad it so that `chalk.inverse()` covers the whole
// line
const fitContent = ({ content }) => content.split('\n').map(fitLine).join('\n')

const fitLine = (string) => {
  const stringA = cliTruncate(string, LINE_SIZE - 1, {
    preferTruncationOnSpace: true,
  })
  const stringB = stringA.padEnd(LINE_SIZE)
  return stringB
}
