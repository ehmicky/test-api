import { filterFormDataMimes } from './form_data.js'

// Get OpenAPI `consumes` and `produces` properties as request headers
export const getNegotiationsParams = ({ spec, operation, params }) => {
  const contentType = getContentTypeParam({ spec, operation, params })
  const accept = getAcceptParam({ spec, operation })
  return { ...contentType, ...accept }
}

// Get `consumes` and `produces` OpenAPI properties as header parameters instead
// A random request Content-Type will be picked
const getContentTypeParam = ({ spec, operation, params }) => {
  const consumes = getConsumes({ spec, operation })

  if (consumes === undefined) {
    return
  }

  const consumesA = filterFormDataMimes({ mimes: consumes, params })
  const value = { type: 'string', enum: consumesA }
  return { 'headers.content-type': value }
}

// But the Accept header is always the same
const getAcceptParam = ({ spec, operation }) => {
  const produces = getProduces({ operation, spec })

  if (produces === undefined) {
    return
  }

  const accept = produces.join(',')
  const value = { type: 'string', enum: [accept] }
  return { 'headers.accept': value }
}

// Get OpenAPI `produces` property as a `Content-Type` response header
export const getNegotiationsResponse = ({ spec, operation }) => {
  const produces = getProduces({ spec, operation })

  if (produces === undefined) {
    return
  }

  return { 'content-type': { type: 'string', enum: produces } }
}

const getConsumes = ({
  spec: { consumes: specConsumes },
  operation: { consumes = specConsumes },
}) => consumes

const getProduces = ({
  spec: { produces: specProduces },
  operation: { produces = specProduces },
}) => produces
