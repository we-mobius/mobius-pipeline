import { build } from 'esbuild'

build({
  entryPoints: ['./src/support/loader.ts'],
  outfile: './dist/support/loader.js',
  platform: 'node',
  target: 'esnext',
  bundle: true,
  external: ['./node_modules/*'],
  format: 'esm',
  logLevel: 'error'
}).then(buildResult => {
  console.log({ ...buildResult, warnings: buildResult.warnings.map(warning => warning.text) })
}).catch(() => process.exit(1))
