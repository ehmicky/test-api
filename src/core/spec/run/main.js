import { addSpecToCall } from './call.js'
import { getOperation } from './operation.js'
import { addSpecToValidate } from './validate.js'

// Add OpenAPI specification to `task.call|validate.*`
// According to `task.spec.definition` and `task.spec.operation`
export const run = (
  { key, call, validate, spec },
  { pluginNames, startData },
) => {
  const operation = getOperation({ key, spec, startData })

  // Task `operationId` was not found, or there is no OpenAPI definition
  if (operation === undefined) {
    return
  }

  const callA = addSpecToCall({ call, operation })

  const validateA = addSpecToValidate({ validate, pluginNames, operation })

  return { call: callA, validate: validateA }
}
