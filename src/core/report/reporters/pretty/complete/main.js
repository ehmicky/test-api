import { getReportProps } from '../../../props/main.js'
import { getResultType } from '../../../utils/result_type.js'
import { clearSpinner } from '../../../utils/spinner.js'

import { getHeader } from './header.js'
import { printReportProps } from './report_props.js'

// Print task errors and update spinner
export const complete = (
  task,
  { options: { spinner }, silent, ...context },
) => {
  if (silent) {
    return ''
  }

  clearSpinner(spinner)

  const message = getMessage({ task, context })
  return message
}

// Retrieve task's message to print
const getMessage = ({ task, context }) => {
  const resultType = getResultType(task)

  const { titles, reportProps } = getReportProps({ task, context })

  const header = getHeader({ task, titles, resultType })

  const reportPropsA = printReportProps({ reportProps, resultType })

  return `\n${header}${reportPropsA}\n`
}
