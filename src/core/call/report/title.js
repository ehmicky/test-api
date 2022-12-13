// Add `METHOD URL (STATUS)` to reporting
export const getTitle = ({ rawRequest, rawResponse }) => {
  const url = getUrl({ rawRequest })
  const status = getStatus({ rawResponse })
  return [url, status].filter((part) => part !== undefined).join(' ')
}

const getUrl = ({ rawRequest: { method, url } }) => {
  // We haven't reached `url` stage yet
  if (url === undefined) {
    return
  }

  const urlA = url.replace(QUERY_REGEXP, '')

  return `${method.toUpperCase()} ${urlA}`
}

// Remove query variables from URL
const QUERY_REGEXP = /\?.*/u

const getStatus = ({ rawResponse: { status } = {} }) => {
  // We haven't reached `request` stage yet
  if (status === undefined) {
    return
  }

  return `(${status})`
}
