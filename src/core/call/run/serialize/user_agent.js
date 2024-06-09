import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readPackageUp } from 'read-package-up'

// Add `User-Agent` request header
// Can be overriden
export const normalizeUserAgent = async ({
  call,
  call: { 'headers.user-agent': userAgent },
}) => {
  const userAgentA = await getUserAgent({ userAgent })
  return { ...call, 'headers.user-agent': userAgentA }
}

const getUserAgent = async ({ userAgent }) => {
  if (userAgent !== undefined) {
    return userAgent
  }

  const cwd = dirname(fileURLToPath(import.meta.url))
  const {
    packageJson: { name, version, homepage },
  } = await readPackageUp({ cwd })
  return `${name}/${version} (${homepage})`
}
