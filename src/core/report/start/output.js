import { createWriteStream } from 'node:fs'
import { stdout } from 'node:process'

import { TestApiError } from '../../../errors/error.js'

// Where to output report according to `config.report.REPORTER.output`
export const normalizeOutput = async ({
  options: { output },
  reporter: { name },
}) => {
  // When `config.report.REPORTER.output` is `undefined` (default), write to
  // `stdout`
  if (output === undefined) {
    return stdout
  }

  // Otherwise write to a file
  try {
    return await getFileStream(output)
  } catch (error) {
    throw new TestApiError(
      `Could not write output to file '${output}': ${error.message}`,
      { props: { property: `config.report.${name}.output`, value: output } },
    )
  }
}

const getFileStream = (output) =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    const stream = createWriteStream(output)
    stream.on('open', resolve.bind(undefined, stream))
    stream.on('error', reject)
  })
