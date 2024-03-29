// Use dot notation for `task.call.*`, e.g. `task.call['query.VAR']`
// to indicate both `location` and `name`
export const keyToLocation = ({ key }) => {
  if (SINGLE_NAME_LOCATIONS.has(key)) {
    return { location: key, name: key }
  }

  const [location, ...name] = key.split('.')
  const nameA = name.join('.')

  return { location, name: nameA }
}

export const locationToKey = ({ location, name }) => {
  if (SINGLE_NAME_LOCATIONS.has(location)) {
    return location
  }

  const key = `${location}.${name}`
  const keyA = normalizeHeaderKey(key)
  return keyA
}

// Those locations do not use dot notations
const SINGLE_NAME_LOCATIONS = new Set(['method', 'server', 'path', 'body'])

// Headers are normalized to lowercase, to make them case-insensitive
const normalizeHeaderKey = (key) => {
  if (!key.startsWith('headers.')) {
    return key
  }

  return key.toLowerCase()
}
