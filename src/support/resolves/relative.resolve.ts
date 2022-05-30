import * as path from 'node:path'
import type { ChildResolveHookOfESMLoader } from '../loaders'

export const isRelativeSpecifier = (specifier: string): boolean => specifier.startsWith('.')

export const resolveRelativeSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
  console.log('[ts-loader] resolve relative path: ', specifier)
  const { parentURL } = context
  const baseURL = parentURL ?? process.cwd()
  console.log('[ts-loader] relative in: ', baseURL)
  const resolvedSpecifier = path.resolve(baseURL, '../', specifier)
  console.log('[ts-loader] resolved relative path: ', resolvedSpecifier)
  return await parentResolve(resolvedSpecifier, context, defaultResolve)
}
