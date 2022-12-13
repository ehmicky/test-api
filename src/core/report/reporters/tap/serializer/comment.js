import { checkArgument } from './check.js'

// TAP comment
export const comment = ({ colors }, commentString) => {
  checkArgument(commentString, 'string')

  return colors.comment(`# ${comment}\n\n`)
}
