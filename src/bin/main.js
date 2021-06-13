#!/usr/bin/env node
import { dirname } from 'path'
import { exit } from 'process'
import { fileURLToPath } from 'url'

import { readPackageUpAsync } from 'read-pkg-up'
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
    runCliHandler(error)
  }
}

// TODO: use static JSON imports once those are possible
const checkUpdate = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const { packageJson } = await readPackageUpAsync({ cwd, normalize: false })
  UpdateNotifier({ pkg: packageJson }).notify()
}

// If an error is thrown, print error's description, then exit with exit code 1
const runCliHandler = function (error) {
  const { tasks, message } = error instanceof Error ? error : new Error(error)

  // Do not print error message if the error happened during task running, as
  // it's already been reported using `report`
  if (tasks === undefined) {
    console.error(message)
  }

  exit(1)
}

runCli()
