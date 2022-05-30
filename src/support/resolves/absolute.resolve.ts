import * as path from 'node:path'
import * as fs from 'node:fs'

import type { ChildResolveHookOfESMLoader } from '../loaders'

const isDirectory = (path: string): boolean => fs.lstatSync(path).isDirectory()
const isFile = (path: string): boolean => fs.lstatSync(path).isFile()

export const isAbsoluteSpecifier = (specifier: string): boolean => path.isAbsolute(specifier)

export const resolveAbsoluteSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
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
      return await parentResolve(resolvedSpecifier, context, defaultResolve)
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
      return await parentResolve(resolvedSpecifier, context, defaultResolve)
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
          return await parentResolve(resolvedSpecifier, context, defaultResolve)
        }
      }
    }
  }
}
