import lodash from 'lodash'

import { TestApiError } from '../../../../../errors/error.js'
import { locationToKey } from '../../../../../utils/location.js'

import { IN_TO_LOCATION } from './in_to_location.js'

// Normalize OpenAPI security request parameters into specification-agnostic
// format
export const getSecParams = function ({
  spec: { securityDefinitions, security: apiSecurity = [] },
  operation: { security = apiSecurity },
}) {
  const secRefs = getSecRefs({ security })
  const secParams = secRefs.map(([secName, scopes]) =>
    getSecParam({ secName, scopes, securityDefinitions }),
  )
  const secParamsA = Object.assign({}, ...secParams)
  return secParamsA
}

const getSecRefs = function ({ security }) {
  const securityA = security.flatMap(Object.entries)
  const securityB = lodash.uniqBy(securityA, JSON.stringify)
  return securityB
}

// Retrieve among the `securityDefinitions`
const getSecParam = function ({ secName, scopes, securityDefinitions }) {
  const securityDef = securityDefinitions[secName]
  const securityDefA = normalizeSecurityDef({ securityDef, secName, scopes })
  return securityDefA
}

// Normalize security to the same format as other parameters
const normalizeSecurityDef = function ({ securityDef, secName, scopes }) {
  const handler = getSecParamHandler({ securityDef, secName })
  const secParam = handler({ ...securityDef, scopes })
  return secParam
}

const getSecParamHandler = function ({ securityDef: { type }, secName }) {
  const handler = SECURITY_DEFS[type]

  if (handler !== undefined) {
    return handler
  }

  throw new TestApiError(
    `In 'securityDefinitions.${secName}', security definition has type '${type}' but this has not been implemented yet`,
  )
}

// `apiKey` security definitions -> `headers|query` request parameter
const getDefApiKey = function ({ name, in: paramIn }) {
  const location = IN_TO_LOCATION[paramIn]
  const key = locationToKey({ name, location })

  return { [key]: { type: 'string', optional: true } }
}

const SECURITY_DEFS = {
  apiKey: getDefApiKey,
}
