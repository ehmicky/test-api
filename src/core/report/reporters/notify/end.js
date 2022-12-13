import { fileURLToPath } from 'node:url'

import notifier from 'node-notifier'

import { isSilentType } from '../../level/silent.js'
import { getSummary } from '../../utils/summary.js'

// Show notification at end of run
export const end = (tasks, { options }) => {
  const opts = getOpts({ tasks, options })

  if (opts === undefined) {
    return
  }

  notifier.notify(opts)
}

const getOpts = ({ tasks, options }) => {
  const { ok, total, pass, fail, skip } = getSummary({ tasks })

  const { resultType, ...opts } = OPTS[ok]

  if (isSilentType({ resultType, options })) {
    return
  }

  const message = opts.message({ total, pass, fail })

  const messageA = addSkipMessage({ message, skip, options })

  return { ...opts, message: messageA }
}

const getPassMessage = ({ total, pass }) => `${pass} of ${total} tasks passed.`

const getFailMessage = ({ total, fail }) => `${fail} of ${total} tasks failed.`

const addSkipMessage = ({ message, skip, options }) => {
  if (skip === 0 || isSilentType({ resultType: 'skip', options })) {
    return message
  }

  return `${message}\n${skip} tasks were skipped.`
}

const PASS_OPTS = {
  title: 'Tasks passed.',
  message: getPassMessage,
  icon: fileURLToPath(new URL('passed.png', import.meta.url)),
  sound: false,
  resultType: 'pass',
}

const FAIL_OPTS = {
  title: 'Tasks failed!',
  message: getFailMessage,
  icon: fileURLToPath(new URL('failed.png', import.meta.url)),
  sound: 'Basso',
  resultType: 'fail',
}

const OPTS = {
  true: PASS_OPTS,
  false: FAIL_OPTS,
}
