import { TestApiError } from '../../errors/error.js'
import { isObject } from '../../utils/types.js'

// Validate content of tasks specified inline
export const validateInlineTasks = ({ tasks }) => {
  tasks.forEach(validateInlineTask)
}

const validateInlineTask = (task) => {
  if (isObject(task)) {
    return
  }

  throw new TestApiError(
    `One of the inline tasks is a ${typeof task} but it should instead be an object`,
  )
}
