import * as SWC from '@swc/core'
import type { LoadHookOfESMLoader } from './loaders'

export const load: LoadHookOfESMLoader = async (url, context, defaultLoad) => {
  if (url.endsWith('.ts')) {
    const transformed = SWC.transformFileSync(url, {})
    return { format: 'module', source: transformed.code }
  }

  // Let Node.js handle all other URLs.
  return await defaultLoad(url, context, defaultLoad)
}
