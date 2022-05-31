import { pathToFileURL } from 'node:url'
import { LoggerForResolve as Logger } from '../common/logger'

import type { ChildResolveHookOfESMLoader } from '../loaders'

const BUILTIN_SPECIFIER_PREFIX = 'node:'
export const isBuiltinSpecifier = (specifier: string): boolean => specifier.startsWith(BUILTIN_SPECIFIER_PREFIX)
export const resolveBuiltinSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
  Logger.log(`[BuiltinResolve] enter: ${specifier}`)
  Logger.log(`[BuiltinResolve] pass specifier to Node.js default resolve: ${specifier}`)
  // @see https://nodejs.org/api/errors.html#err_invalid_url
  const defaultResolveContext = {
    ...context, parentURL: context.parentURL !== undefined ? pathToFileURL(context.parentURL).href : undefined
  }
  Logger.log(`[BuiltinResolve] default resolve context: ${JSON.stringify(defaultResolveContext)}`)
  return await defaultResolve(specifier, defaultResolveContext, defaultResolve)
}
