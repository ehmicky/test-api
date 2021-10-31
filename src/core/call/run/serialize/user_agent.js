import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { readPackageUp } from 'read-pkg-up'

// Add `User-Agent` request header
// Can be overriden
export const normalizeUserAgent = async function ({
  call,
  call: { 'headers.user-agent': userAgent },
}) {
  const userAgentA = await getUserAgent({ userAgent })
  return { ...call, 'headers.user-agent': userAgentA }
}

const getUserAgent = async function ({ userAgent }) {
  if (userAgent !== undefined) {
    return userAgent
  }

  const cwd = dirname(fileURLToPath(import.meta.url))
  const {
    packageJson: { name, version, homepage },
  } = await readPackageUp({ cwd })
  return `${name}/${version} (${homepage})`
}
