import { TestApiError } from '../../../../errors/error.js'

// Escape, normalize and validate the request URL
export const normalizeUrl = (originalUrl) => {
  const url = escapeUrl(originalUrl)

  try {
    return new URL(url).toString()
  } catch (error) {
    throw new TestApiError(
      `Request URL '${originalUrl}' is not a valid full URL: ${error.message}`,
      // It could come from either `server` or `path`
      { props: { property: 'task.call', value: originalUrl } },
    )
  }
}

// According to RFC 3986, all characters should be escaped in paths except:
//   [:alnum:]-.+_~!$&'()*,;=:@/
// However `encodeURI()` does not escape # and ? so we escape them
// This is the same situation for origins, except RFC 3986 forbids slashes, but
// we allow it since `task.call.server` can contain the base path.
const escapeUrl = (url) =>
  encodeURI(url).replaceAll('#', '%23').replaceAll('?', '%3F')
