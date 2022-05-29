import * as SWC from '@swc/core'

import * as path from 'node:path'
import * as fs from 'node:fs'
import * as process from 'node:process'
import type { ResolveHookOfESMLoader, LoadHookOfESMLoader } from './loaders'

// node --experimental-loader file://D://Root//Files//CodeSpace//mobius-project-workspace//mobius-pipeline//dist//support/ts-loader.js .\src\test.ts

const isDirectory = (path: string): boolean => fs.lstatSync(path).isDirectory()
const isFile = (path: string): boolean => fs.lstatSync(path).isFile()

/**
 * The goal of resolve hook is to resolve all of specifiers to absolute paths that truely exist and valid.
 */
export const resolve: ResolveHookOfESMLoader = async (specifier, context, defaultResolve) => {
  console.log('[ts-loader] start resolve: ', specifier)

  // Handle absolute path.
  // e.g. import * as foo from 'D:\\foo'
  // For what will be considered as absolute path, see https://nodejs.org/api/path.html#pathisabsolutepath
  if (path.isAbsolute(specifier)) {
    console.log('[ts-loader] resolve absolute path', specifier)

    if (fs.existsSync(specifier)) {
      if (isFile(specifier)) {
        console.log('[ts-loader] absolute path is refer to a file: ', specifier)
        console.log('[ts-loader] resolved absolute path: ', specifier)
        return { url: specifier }
      } else if (isDirectory(specifier)) {
        console.log('[ts-loader] absolute path is refer to a directory: ', specifier)
        const files = fs.readdirSync(specifier, { encoding: 'utf8' })
        const assumeSubpath = files.length === 1 ? files[0] : 'index'
        const resolvedSpecifier = path.join(specifier, assumeSubpath)
        console.log('[ts-loader] resolved absolute path: ', resolvedSpecifier)
        return await resolve(resolvedSpecifier, context, defaultResolve)
      } else {
        console.log('[ts-loader] absolute path is not a file or directory: ', specifier)
        throw new Error(`[ts-loader] absolute path is not a file or directory: ${specifier}`)
      }
    } else {
      // @see https://nodejs.org/api/path.html#pathparsepath
      const { dir, base, ext, name } = path.parse(specifier)
      // There is no need to check if the specifier refers to a directory,
      // if so, the specifier will be captured by `isDirectory` condition branch above.
      if (ext !== '') {
        console.log('[ts-loader] assume absolute refers to a file with extension name: ', specifier)
        const EXPECTED_EXTENSION_MAPPINGS = {
          '.ts': '.js',
          '.mts': '.mjs',
          '.cts': '.cjs',
          '.tsx': '.jsx',
          '.js': '.ts',
          '.mjs': '.mts',
          '.cjs': '.cts',
          '.jsx': '.tsx'
        } as const
        // the file sepcifier refers is not exist, check if there is a replacement file
        const replacementExtension = EXPECTED_EXTENSION_MAPPINGS[ext as keyof typeof EXPECTED_EXTENSION_MAPPINGS]
        if (replacementExtension === undefined) {
          throw new Error(`[ts-loader] absolute path is not exist and cannot be replaced: ${specifier}`)
        }
        const resolvedSpecifier = path.join(dir, name + replacementExtension)
        console.log('[ts-loader] resolved absolute path: ', resolvedSpecifier)
        return await resolve(resolvedSpecifier, context, defaultResolve)
      } else {
        console.log('[ts-loader] assume absolute path refers to a file without extension name: ', specifier)
        const EXPECTED_EXTENSIONS = ['.mts', '.cts', '.ts', '.tsx', '.mjs', '.cjs', '.js', '.jsx', '.json']
        const directoryOfSpecifier = path.dirname(specifier)
        if (!fs.existsSync(directoryOfSpecifier)) {
          console.log(`[ts-loader] directory of target path is not exist: ${directoryOfSpecifier}, when resolving absolute path: ${specifier}`)
          throw new Error(`[ts-loader] directory of target path is not exist: ${directoryOfSpecifier}, when resolving absolute path: ${specifier}`)
        } else {
          // returned filenames of fs.readdirSync are with extension name
          const files = fs.readdirSync(directoryOfSpecifier, { encoding: 'utf8' }).filter(filename => filename.startsWith(name))
          if (files.length === 0) {
            console.log(`[ts-loader] no file named "${name}" found in directory: `, directoryOfSpecifier)
            throw new Error(`[ts-loader] no file named "${name}" found in directory: ${directoryOfSpecifier}`)
          } else {
            const expectedExtension = EXPECTED_EXTENSIONS.find(extension => files.some(filename => filename.endsWith(extension)))
            const expectedFilename = expectedExtension === undefined ? files[0] : name + expectedExtension
            const resolvedSpecifier = path.join(directoryOfSpecifier, expectedFilename)
            console.log('[ts-loader] resolved absolute path: ', resolvedSpecifier)
            return await resolve(resolvedSpecifier, context, defaultResolve)
          }
        }
      }
    }
  }

  // Handle relative path.
  // e.g. import * as foo from './foo'
  if (specifier.startsWith('.')) {
    console.log('[ts-loader] resolve relative path: ', specifier)
    const { parentURL } = context
    const baseURL = parentURL ?? process.cwd()
    console.log('[ts-loader] relative in: ', baseURL)
    const resolvedSpecifier = path.resolve(baseURL, '../', specifier)
    console.log('[ts-loader] resolved relative path: ', resolvedSpecifier)
    return await resolve(resolvedSpecifier, context, defaultResolve)
  }

  // Handle file:// URLS.
  // e.g. import * as foo from 'file:///D:/foo'
  // Remove the prefix of the specifier, the rest will be an absolute path,
  // just pass it to resolve hook again, absolute path resolver will take it.
  const FILE_SPECIFIER_PREFIX = 'file:///'
  if (specifier.startsWith(FILE_SPECIFIER_PREFIX)) {
    console.log('[ts-loader] resolve file path: ', specifier)
    const resolvedSpecifier = path.resolve(specifier.slice(FILE_SPECIFIER_PREFIX.length))
    console.log('[ts-loader] resolved file path: ', resolvedSpecifier)
    return await resolve(resolvedSpecifier, context, defaultResolve)
  }

  // Handle Node.js built-in modules.
  // e.g. import * as fs from 'node:path'
  if (specifier.startsWith('node:')) {
    console.log('[ts-loader] resolve node built-in module: ', specifier)
    return await defaultResolve(specifier, context, defaultResolve)
  }

  // Handler path/module alias.
  // TODO: support alias resolving

  console.log('[ts-loader] resolve specifier by default resolver: ', specifier)
  // Let Node.js handle all other specifiers.
  return await defaultResolve(specifier, context, defaultResolve)
}

export const load: LoadHookOfESMLoader = async (url, context, defaultLoad) => {
  if (url.endsWith('.ts')) {
    const transformed = SWC.transformFileSync(url, {})
    return { format: 'module', source: transformed.code }
  }

  // Let Node.js handle all other URLs.
  return await defaultLoad(url, context, defaultLoad)
}
