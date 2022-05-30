import type { ChildResolveHookOfESMLoader } from '../loaders'

const BUILTIN_SPECIFIER_PREFIX = 'node:'
export const isBuiltinSpecifier = (specifier: string): boolean => specifier.startsWith(BUILTIN_SPECIFIER_PREFIX)
export const resolveBuiltinSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
  console.log('[ts-loader] resolve node built-in module: ', specifier)
  return await defaultResolve(specifier, context, defaultResolve)
}
