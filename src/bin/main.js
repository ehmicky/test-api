#!/usr/bin/env node
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import handleCliError from 'handle-cli-error'
import { readPackageUp } from 'read-pkg-up'
import UpdateNotifier from 'update-notifier'

import { run } from '../main.js'

import { parseConfig } from './parse.js'
import { defineCli } from './top.js'

// Parse CLI arguments then run tasks
const runCli = async function () {
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
const isSilentError = function (error) {
  return error instanceof Error && error.tasks !== undefined
}

// TODO: use static JSON imports once those are possible
const checkUpdate = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const { packageJson } = await readPackageUp({ cwd, normalize: false })
  UpdateNotifier({ pkg: packageJson }).notify()
}

await runCli()
