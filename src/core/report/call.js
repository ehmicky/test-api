import { stdout } from 'node:process'
import { promisify } from 'node:util'

import { result } from '../../utils/result.js'

// Call reporters' functions then write return value to output
export const callReporters = async ({ reporters, type }, ...args) => {
  const promises = reporters.map((reporter) =>
    callReporter({ reporter, type }, ...args),
  )
  await Promise.all(promises)
}

const callReporter = async (
  {
    reporter,
    reporter: {
      options,
      options: { output },
    },
    type,
  },
  ...args
) => {
  if (reporter[type] === undefined) {
    return
  }

  const argsA = getArgs({ args, options })

  const message = await reporter[type](...argsA)

  if (message !== undefined) {
    output.write(message)
  }

  if (type === 'end') {
    await endReporting({ output })
  }
}

const getArgs = ({ args, options }) => {
  const [argA, context] = args.map((arg) => result(arg, { options }))
  const argsA = [argA, { ...context, options }].filter(
    (argB) => argB !== undefined,
  )
  return argsA
}

const endReporting = async ({ output }) => {
  // Give enough time for `output` stream to be flushed
  // TODO: replace with `timers/promises` `setTimeout()` after dropping support
  // for Node <15.0.0
  await promisify(setTimeout)()

  if (output === stdout) {
    return
  }

  output.destroy()
}
