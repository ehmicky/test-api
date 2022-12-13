#!/usr/bin/env node
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import handleCliError from 'handle-cli-error'
import { readPackageUp } from 'read-pkg-up'
import updateNotifier from 'update-notifier'

import { run } from '../main.js'

import { parseConfig } from './parse.js'
import { defineCli } from './top.js'

// Parse CLI arguments then run tasks
const runCli = async () => {
  try {
    await checkUpdate()

    const yargs = defineCli()
    const config = parseConfig({ yargs })
    const tasks = await run(config)
    return tasks
  } catch (error) {
    handleCliError(error, { silent: isSilentError(error), stack: false })
  }
}

// Do not print error message if the error happened during task running, as
// it's already been reported using `report`
const isSilentError = (error) =>
  error instanceof Error && error.tasks !== undefined

// TODO: use static JSON imports once those are possible
const checkUpdate = async () => {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const { packageJson } = await readPackageUp({ cwd, normalize: false })
  updateNotifier({ pkg: packageJson }).notify()
}

await runCli()
