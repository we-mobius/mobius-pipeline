import { build } from 'esbuild'

// node --experimental-loader file://D://Root//Files//CodeSpace//mobius-project-workspace//mobius-pipeline//dist//support/loader.js .\src\executables\build.ts

build({
  entryPoints: ['./src/executables/mow.ts'],
  outfile: './bin/mow.js',
  platform: 'node',
  target: 'es6',
  bundle: true,
  external: ['./node_modules/*'],
  format: 'esm',
  logLevel: 'error'
}).then(buildResult => {
  console.log({ ...buildResult, warnings: buildResult.warnings.map(warning => warning.text) })
}).catch(() => process.exit(1))
