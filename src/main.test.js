import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import test from 'ava'
import { execa } from 'execa'
import { getBinPath } from 'get-bin-path'
import unixify from 'unixify'

const TASKS_FILE = fileURLToPath(new URL('tasks.yml', import.meta.url))
const TASKS_GLOB = unixify(relative('.', TASKS_FILE))

test('Smoke test', async (t) => {
  const binaryPath = await getBinPath()
  const { exitCode, stdout } = await execa('node', [binaryPath, TASKS_GLOB], {
    reject: false,
  })
  const stdoutA = stdout
    .replaceAll(/User-Agent.*/gu, '')
    .replaceAll(/ [^ :]+:80/gu, '')
    .replaceAll(/(Could not connect).*/gmu, '$1')
  t.snapshot({ exitCode, stdout: stdoutA })
})
