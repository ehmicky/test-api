import { gray, green, red, yellow } from '../../utils/colors.js'

import { init } from './serializer/main.js'

// Set TAP state
export const options = ({ _tasks: tasks }) => {
  const count = tasks.length
  const tap = init({ count, colors: THEME })
  return { tap }
}

const THEME = {
  pass: green,
  fail: red,
  comment: gray,
  skip: gray,
  version: gray,
  plan: gray,
  final: yellow,
}
