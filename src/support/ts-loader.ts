import * as SWC from '@swc/core'

import { fileURLToPath } from 'node:url'
import type { ResolveHookOfESMLoader, LoadHookOfESMLoader } from './loaders'

// node --experimental-loader file://D://Root//Files//CodeSpace//mobius-project-workspace//mobius-pipeline//dist//support/ts-loader.js .\src\test.ts

const extensionsRegex = /\.ts$/

export const resolve: ResolveHookOfESMLoader = async (specifier, context, defaultResolve) => {
  if (extensionsRegex.test(specifier)) {
    return {
      url: fileURLToPath(specifier)
    }
  }

  // Let Node.js handle all other specifiers.
  return await defaultResolve(specifier, context, defaultResolve)
}

export const load: LoadHookOfESMLoader = async (url, context, defaultLoad) => {
  const transformed = SWC.transformFileSync(url, {})
  return { format: 'module', source: transformed.code }

  // Let Node.js handle all other URLs.
  return await defaultLoad(url, context, defaultLoad)
}
