import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import test from 'ava'
import spawn from 'nano-spawn'
import { getBinPath } from 'get-bin-path'
import unixify from 'unixify'

const TASKS_FILE = fileURLToPath(new URL('tasks.yml', import.meta.url))
const TASKS_GLOB = unixify(relative('.', TASKS_FILE))

const BIN_PATH = getBinPath()

test('Smoke test', async (t) => {
  const { exitCode, stdout } = await t.throwsAsync(
    spawn('node', [await BIN_PATH, TASKS_GLOB]),
  )
  const stdoutA = stdout
    .replaceAll(/User-Agent.*/gu, '')
    .replaceAll(/ [^ :]+:80/gu, '')
    .replaceAll(/(Could not connect).*/gmu, '$1')
  t.snapshot({ exitCode, stdout: stdoutA })
})
