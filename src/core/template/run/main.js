import { includeKeys } from 'filter-obj'
import omit from 'omit.js'

import { evalTemplate } from '../../../template/eval.js'
import { promiseThen } from '../../../utils/promise.js'

import { templateHandler } from './error.js'
import { getPluginsVars } from './plugin.js'

// Substitute templates `{ $$name: arg }` and `$$name` for dynamic values.
// Including in deep properties.
// Templates are substituted before the task run, e.g. plugins do not need to be
// template-aware.
// Templating still happen after:
//  - `task|only` plugins: to avoid unnecessary long template evaluation on
//     skipped task
//  - `repeat` plugin: to repeat template variables that rely on global state,
//     e.g. `$$random` or `$$task`
// We do not provide an utility (e.g. `context.template()`) for other plugins to
// use templating because:
//  - some template variables are task-specific, others not, i.e. we would need
//    to provide different template variables at different stages, creating
//    many issues
//  - templating is a user-facing feature. Plugin writers can import template
//    functions directly and use their functions if needed.
export const run = (task, context) => {
  const { vars, pluginsVarsMap } = getVars({ task, context })

  const noEvalProps = includeKeys(task, NO_EVAL_PROPS)
  const taskA = omit.default(task, NO_EVAL_PROPS)

  const taskB = evalTaskTemplate({ task: taskA, vars, pluginsVarsMap })

  return promiseThen(taskB, (taskC) => returnTask({ task: taskC, noEvalProps }))
}

// Make sure those properties are not checked for templating
const NO_EVAL_PROPS = ['originalTask', 'key', 'variables', 'template']

// Retrieving variables cannot happen during a `start` handler because we might
// need to pass `context._runTask()`, e.g. to `variables` `plugin.template()`
const getVars = ({ task: { template: taskTemplates }, context }) => {
  const { pluginsVars, pluginsVarsMap } = getPluginsVars({ context })

  const vars = { ...pluginsVars, ...taskTemplates }

  return { vars, pluginsVarsMap }
}

const evalTaskTemplate = ({ task, vars, pluginsVarsMap }) => {
  try {
    const retVal = evalTemplate(task, vars)
    return retVal && typeof retVal.then === 'function'
      ? // eslint-disable-next-line promise/prefer-await-to-then, promise/prefer-await-to-callbacks
        retVal.catch((error) => templateHandler(error, { pluginsVarsMap }))
      : retVal
  } catch (error) {
    templateHandler(error, { pluginsVarsMap })
  }
}

// Update `originalTask` so that templates are shown evaluated in both return
// value and reporting
const returnTask = ({ task, noEvalProps }) => {
  const taskA = { ...task, ...noEvalProps }

  // No nested `originalTask` in final return value
  const taskB = omit.default(taskA, ['originalTask'])
  return { ...taskB, originalTask: taskB }
}
