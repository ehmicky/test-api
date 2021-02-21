// eslint-disable-next-line you-dont-need-lodash-underscore/get
import { get, mapValues } from 'lodash'

import { isObject } from '../../../../../utils/types.js'

import { getChalk } from './chalk.js'

// Used for colored output
// `opts.colors: false` can be used to disable it
// `opts.colors: object` can be used to theme
// By default, it guesses (e.g. no colors if output is redirected)
export const getColors = function (colors) {
  const chalk = getChalk(colors)
  const theme = getTheme({ chalk, colors })
  return theme
}

const getTheme = function ({ chalk, colors }) {
  return mapValues(DEFAULT_THEME, (defaultColor, key) =>
    getThemeColor({ defaultColor, colors, key, chalk }),
  )
}

const DEFAULT_THEME = {
  pass: 'green',
  fail: 'red',
  comment: 'gray',
  skip: 'gray',
  version: 'gray',
  plan: 'gray',
  final: 'yellow',
}

const getThemeColor = function ({ defaultColor, colors, key, chalk }) {
  const color = getColor({ defaultColor, colors, key })

  if (typeof color === 'function') {
    return color
  }

  return get(chalk, color)
}

const getColor = function ({ defaultColor, colors, key }) {
  if (!isObject(colors) || colors[key] === undefined) {
    return defaultColor
  }

  return colors[key]
}
