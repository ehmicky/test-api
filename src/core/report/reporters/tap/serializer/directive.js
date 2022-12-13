import { checkArgument } from './check.js'

// Retrieve '# SKIP|TODO' directive for plan or asserts
export const getDirective = ({ directive = {} }) => {
  checkArgument(directive, 'object')

  const [directiveName, comment] =
    Object.entries(directive).find(isDirective) || []

  if (directiveName === undefined || comment === false) {
    return ''
  }

  const directiveString = ` # ${directiveName.toUpperCase()}`

  const directiveComment = getDirectiveComment({ comment })

  return `${directiveString}${directiveComment}`
}

const isDirective = ([name]) => DIRECTIVES.has(name.toLowerCase())

const DIRECTIVES = new Set(['skip', 'todo'])

const getDirectiveComment = ({ comment }) => {
  if (comment === undefined || comment === true) {
    return ''
  }

  checkArgument(comment, 'string')

  return ` ${comment}`
}
