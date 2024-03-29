import { createRequire } from 'node:module'

import omit from 'omit.js'

import { checkSchema } from './check.js'

const JSON_SCHEMA_SCHEMA = 'ajv/lib/refs/json-schema-draft-04.json'

// TODO: remove once JSON imports are possible
const requireJson = createRequire(import.meta.url)

// Like `checkSchema()` but validating that the value is a JSON schema v4
export const checkIsSchema = (opts) => {
  const message = getSchemaMessage(opts)

  checkSchema({ schema: jsonSchemaSchema, message, ...opts })
}

const getSchemaMessage = ({ valueProp }) => {
  const name = valueProp === undefined ? 'schema' : `'${valueProp}'`
  return `${name} is not a valid JSON schema version 4`
}

const getJsonSchemaSchema = () =>
  SCHEMA_FIXES.reduce(
    (schema, fix) => fix(schema),
    requireJson(JSON_SCHEMA_SCHEMA),
  )

const removeId = (schema) => omit.default(schema, ['id', '$schema'])

// `exclusiveMinimum` boolean is not valid in the JSON schema version
// used by `ajv`
const fixMultipleOf = (schema) => {
  const multipleOf = { type: 'number', exclusiveMinimum: 0 }

  return {
    ...schema,
    properties: { ...schema.properties, multipleOf },
  }
}

// `format` is not present in JSON schema v4 meta-schema but is actually allowed
const fixFormat = (schema) => {
  const format = { type: 'string' }
  return { ...schema, properties: { ...schema.properties, format } }
}

// `x-*` custom properties are not present in JSON schema v4 meta-schema but are
// actually allowed
const fixCustomProperties = (schema) => ({
  ...schema,
  patternProperties: { '^x-*': {} },
  additionalProperties: false,
})

const SCHEMA_FIXES = [removeId, fixMultipleOf, fixFormat, fixCustomProperties]

const jsonSchemaSchema = getJsonSchemaSchema()
