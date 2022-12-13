import { incrementSpinner } from '../../utils/spinner.js'

// Update spinner
export const tick = ({ options: { spinner } }) => {
  incrementSpinner(spinner)
}
