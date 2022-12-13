import { isObject } from './types.js'

// Check if JSON schema is a constant, i.e. `{ enum: [value] }`
export const isSimpleSchema = (schema) =>
  isObject(schema) && Array.isArray(schema.enum) && schema.enum.length === 1

export const getSimpleSchemaConstant = (schema) => schema.enum[0]
