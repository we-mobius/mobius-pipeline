import { pathToFileURL } from 'node:url'
import { isAbsoluteSpecifier, resolveAbsoluteSpecifier } from './absolute.resolve'
import { isRelativeSpecifier, resolveRelativeSpecifier } from './relative.resolve'
import { isFileSpecifier, resolveFileSpecifier } from './file.resolve'
import { isBuiltinSpecifier, resolveBuiltinSpecifier } from './builtin.resolve'
import { isAliasSpecifier, resolveAliasSpecifier } from './alias.resolve'

import { LoggerForResolve as Logger } from '../common/logger'

import type { ResolveHookOfESMLoader } from '../loaders'

// node --experimental-loader file://D://Root//Files//CodeSpace//mobius-project-workspace//mobius-pipeline//dist//support/loader.js .\public\examples\main

/**
 * The goal of resolve hook is to resolve all of specifiers to absolute paths that truely exist and valid.
 */
export const resolve: ResolveHookOfESMLoader = async (specifier, context, defaultResolve) => {
  Logger.log(`[MainResolve] enter: ${specifier}`)

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
  Logger.log(`[MainResolve] pass specifier to Node.js default resolve: ${specifier}`)
  // @see https://nodejs.org/api/errors.html#err_invalid_url
  const defaultResolveContext = {
    ...context, parentURL: context.parentURL !== undefined ? pathToFileURL(context.parentURL).href : undefined
  }
  Logger.log(`[MainResolve] default resolve context: ${JSON.stringify(defaultResolveContext)}`)
  return await defaultResolve(specifier, defaultResolveContext, defaultResolve)
}
