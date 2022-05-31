import { spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import * as path from 'node:path'
import * as process from 'node:process'

import type { Context } from './mow.type'

interface RunCommandOptions {
  args: string[]
}
export const run = (options: RunCommandOptions, context: Context): void => {
  // console.log(`[Run] with options: ${JSON.stringify(options, null, 2)}`)
  // console.log(`[Run] with context: ${JSON.stringify(context, null, 2)}`)
  const { args } = options
  if (args.length === 0) {
    console.log('[Run] At least one argument is required.')
  }
  const { execPath, execFilePath } = context
  const [targetFilePath] = args
  const processInstance = spawn(execPath, [
    '--loader',
    pathToFileURL(path.resolve(execFilePath, '../../dist/support/loader.js')).href,
    path.resolve(process.cwd(), targetFilePath)
  ])

  const ignoreWarnings = [
    'ExperimentalWarning: --experimental-loader is an experimental feature.',
    'This feature could change at any time'
  ]

  processInstance.stdout.pipe(process.stdout)
  processInstance.stderr.on('data', (data) => {
    if (!ignoreWarnings.some(warning => data.toString().includes(warning))) {
      process.stderr.write(data, 'utf8')
    }
  })

  processInstance.on('close', (code) => {
    process.exit(code!)
  })
}
