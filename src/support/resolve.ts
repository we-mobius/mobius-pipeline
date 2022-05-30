import { isAbsoluteSpecifier, resolveAbsoluteSpecifier } from './resolves/absolute.resolve'
import { isRelativeSpecifier, resolveRelativeSpecifier } from './resolves/relative.resolve'
import { isFileSpecifier, resolveFileSpecifier } from './resolves/file.resolve'
import { isBuiltinSpecifier, resolveBuiltinSpecifier } from './resolves/builtin.resolve'
import { isAliasSpecifier, resolveAliasSpecifier } from './resolves/alias.resolve'
import type { ResolveHookOfESMLoader } from './loaders'

// node --experimental-loader file://D://Root//Files//CodeSpace//mobius-project-workspace//mobius-pipeline//dist//support/loader.js .\public\examples\main

/**
 * The goal of resolve hook is to resolve all of specifiers to absolute paths that truely exist and valid.
 */
export const resolve: ResolveHookOfESMLoader = async (specifier, context, defaultResolve) => {
  console.log('[ts-loader] start resolve: ', specifier)

  // Handle absolute path.
  // e.g. import * as foo from 'D:\\foo'
  // For what will be considered as absolute path, see https://nodejs.org/api/path.html#pathisabsolutepath
  if (isAbsoluteSpecifier(specifier)) {
    return await resolveAbsoluteSpecifier(specifier, context, defaultResolve, resolve)
  }

  // Handle relative path.
  // e.g. import * as foo from './foo'
  if (isRelativeSpecifier(specifier)) {
    return await resolveRelativeSpecifier(specifier, context, defaultResolve, resolve)
  }

  // Handle file:// URLS.
  // e.g. import * as foo from 'file:///D:/foo'
  // Remove the prefix of the specifier, the rest will be an absolute path,
  // just pass it to resolve hook again, absolute path resolver will take it.
  if (isFileSpecifier(specifier)) {
    return await resolveFileSpecifier(specifier, context, defaultResolve, resolve)
  }

  // Handle Node.js built-in modules.
  // e.g. import * as fs from 'node:path'
  if (isBuiltinSpecifier(specifier)) {
    return await resolveBuiltinSpecifier(specifier, context, defaultResolve, resolve)
  }

  // Handler path/module alias.
  if (isAliasSpecifier(specifier)) {
    return await resolveAliasSpecifier(specifier, context, defaultResolve, resolve)
  }

  // Let Node.js handle all other specifiers.
  console.log('[ts-loader] resolve specifier by default resolver: ', specifier)
  return await defaultResolve(specifier, context, defaultResolve)
}
