
import * as path from 'node:path'
import type { ChildResolveHookOfESMLoader } from '../loaders'

const FILE_SPECIFIER_PREFIX = 'file:///'

export const isFileSpecifier = (specifier: string): boolean => specifier.startsWith(FILE_SPECIFIER_PREFIX)
export const resolveFileSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
  console.log('[ts-loader] resolve file path: ', specifier)
  const resolvedSpecifier = path.resolve(specifier.slice(FILE_SPECIFIER_PREFIX.length))
  console.log('[ts-loader] resolved file path: ', resolvedSpecifier)
  return await parentResolve(resolvedSpecifier, context, defaultResolve)
}
