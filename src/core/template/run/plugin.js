import { BugError } from '../../../errors/error.js'
import { isTemplateName } from '../../../template/parse.js'
import { getPath } from '../../../utils/path.js'

import { wrapTemplateVars } from './check.js'

// Retrieve all `plugin.template`
export const getPluginsVars = ({ context, context: { _plugins: plugins } }) => {
  const pluginsVarsMap = getPluginsVarsMap({ context, plugins })
  const pluginsVars = mergePluginsVars({ plugins, pluginsVarsMap })
  return { pluginsVars, pluginsVarsMap }
}

const getPluginsVarsMap = ({ context, plugins }) => {
  const pluginsVarsMap = plugins.map((plugin) =>
    getPluginVars({ plugin, context }),
  )
  return Object.assign({}, ...pluginsVarsMap)
}

const getPluginVars = ({ plugin, plugin: { name, template }, context }) => {
  if (template === undefined) {
    return
  }

  const vars = getVars({ plugin, context })

  validateVarNames({ vars, plugin })

  const varsA = wrapTemplateVars({ vars, plugin })

  return { [name]: varsA }
}

const getVars = ({ plugin, plugin: { template }, context }) => {
  if (typeof template !== 'function') {
    return template
  }

  try {
    return template(context)
  } catch (error) {
    getVarsHandler(error, { plugin })
  }
}

// Add `error.message|module` when `plugin.template` throws
const getVarsHandler = (error, { plugin: { name } }) => {
  error.message = `Error while retrieving 'plugin.template': ${error.message}`

  if (error.module === undefined) {
    error.module = `plugin-${name}`
  }

  throw error
}

// Validate `plugin.template` return value
const validateVarNames = ({ vars, plugin }) => {
  Object.keys(vars).forEach((name) => {
    validateVarName({ name, plugin })
  })
}

const validateVarName = ({ name, plugin }) => {
  if (isTemplateName({ name })) {
    return
  }

  const property = getPath(['plugin', 'template', name])
  throw new BugError(
    `'plugin.template' returned a template variable with an invalid name '${name}': it must be prefixed with $$ and only contain letters, digits, underscores and dashes`,
    { props: { value: name, property, module: `plugin-${plugin.name}` } },
  )
}

// Ensure `plugin.template` merge priority follows `plugins` order
// Core template variables always have least priority
// Plugin/user-defined template variable have loading priority over core ones.
// Like this, adding core template variables is non-breaking.
// Also this allows overriding / monkey-patching core (which can be
// either good or bad).
const mergePluginsVars = ({ plugins, pluginsVarsMap }) => {
  const pluginsVars = plugins
    .filter(({ name }) => name !== 'template')
    .map(({ name }) => pluginsVarsMap[name])
    .reverse()
  const pluginsVarsA = Object.assign(
    {},
    pluginsVarsMap.template,
    ...pluginsVars,
  )
  return pluginsVarsA
}
