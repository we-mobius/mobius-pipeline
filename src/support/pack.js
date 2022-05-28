import { build } from 'esbuild'

build({
  entryPoints: ['./src/support/ts-loader.ts'],
  outfile: './dist/support/ts-loader.js',
  platform: 'node'
  // bundle: true,
  // external: ['./node_modules/*']
}).then(res => {
  console.log(res)
}).catch(() => process.exit(1))
