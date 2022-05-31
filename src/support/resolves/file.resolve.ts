
import * as path from 'node:path'
import { LoggerForResolve as Logger } from '../common/logger'

import type { ChildResolveHookOfESMLoader } from '../loaders'

const FILE_SPECIFIER_PREFIX = 'file:///'

export const isFileSpecifier = (specifier: string): boolean => specifier.startsWith(FILE_SPECIFIER_PREFIX)
export const resolveFileSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
  Logger.log(`[FileResolve] enter: ${specifier}`)
  const resolvedSpecifier = path.resolve(specifier.slice(FILE_SPECIFIER_PREFIX.length))
  Logger.log(`[FileResolve] pass handled specifier to main resolve: ${resolvedSpecifier}`)
  return await parentResolve(resolvedSpecifier, context, defaultResolve)
}
