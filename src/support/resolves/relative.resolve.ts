import * as path from 'node:path'
import { LoggerForResolve as Logger } from '../common/logger'

import type { ChildResolveHookOfESMLoader } from '../loaders'

export const isRelativeSpecifier = (specifier: string): boolean => specifier.startsWith('.')

export const resolveRelativeSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
  Logger.log(`[RelativeResolve] enter: ${specifier}`)
  const { parentURL } = context
  const baseURL = parentURL ?? process.cwd()
  Logger.log(`[RelativeResolve] specifier considered relative to: ${baseURL}`)
  const resolvedSpecifier = path.resolve(baseURL, '../', specifier)
  Logger.log(`[RelativeResolve] pass handled specifier to main resolve: ${resolvedSpecifier}`)
  return await parentResolve(resolvedSpecifier, context, defaultResolve)
}
