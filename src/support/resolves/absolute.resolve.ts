import * as path from 'node:path'
import * as fs from 'node:fs'
import { LoggerForResolve as Logger } from '../common/logger'

import type { ChildResolveHookOfESMLoader } from '../loaders'

const isDirectory = (path: string): boolean => fs.lstatSync(path).isDirectory()
const isFile = (path: string): boolean => fs.lstatSync(path).isFile()

export const isAbsoluteSpecifier = (specifier: string): boolean => path.isAbsolute(specifier)

export const resolveAbsoluteSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
  Logger.log(`[AbsoluteResolve] enter: ${specifier}`)

  if (fs.existsSync(specifier)) {
    if (isFile(specifier)) {
      Logger.log(`[AbsoluteResolve] specifier refers to a file: ${specifier}`)
      Logger.log(`[AbsoluteResolve] resolved finished: ${specifier}`)
      // TODO: add resolved format
      return { url: specifier }
    } else if (isDirectory(specifier)) {
      Logger.log(`[AbsoluteResolve] specifier refers to a directory: ${specifier}`)
      const files = fs.readdirSync(specifier, { encoding: 'utf8' })
      const assumeSubpath = files.length === 1 ? files[0] : 'index'
      const resolvedSpecifier = path.join(specifier, assumeSubpath)
      Logger.log(`[AbsoluteResolve] pass handled specifier to main resolve: ${resolvedSpecifier}`)
      return await parentResolve(resolvedSpecifier, context, defaultResolve)
    } else {
      Logger.log(`[AbsoluteResolve] specifier unexpectedly refers to a non-file/directory: ${specifier}`)
      throw new Error(`[AbsoluteResolve] specifier unexpectedly refers to a non-file/directory: ${specifier}`)
    }
  } else {
    // @see https://nodejs.org/api/path.html#pathparsepath
    const { dir, base, ext, name } = path.parse(specifier)
    // There is no need to check if the specifier refers to a directory,
    // if so, the specifier will be captured by `isDirectory` condition branch above.
    if (ext !== '') {
      Logger.log(`[AbsoluteResolve] assume specifier refers to a file with extension name: ${specifier}`)
      const EXPECTED_EXTENSION_MAPPINGS = {
        '.js': '.ts',
        '.mjs': '.mts',
        '.cjs': '.cts',
        '.jsx': '.tsx'
      } as const
      // the file sepcifier refers is not exist, check if there is a replacement file
      const replacementExtension = EXPECTED_EXTENSION_MAPPINGS[ext as keyof typeof EXPECTED_EXTENSION_MAPPINGS]
      if (replacementExtension === undefined) {
        Logger.log(`[AbsoluteResolve] the file specifier referred is not exist and cannot be replaced: ${specifier}`)
        throw new Error(`[AbsoluteResolve] the file specifier referred is not exist and cannot be replaced: ${specifier}`)
      }
      Logger.log(`[AbsoluteResolve] the file specifier referred is not exist, try to replace it with ${replacementExtension}`)
      const resolvedSpecifier = path.join(dir, name + replacementExtension)
      Logger.log(`[AbsoluteResolve] pass handled specifier to main resolve: ${resolvedSpecifier}`)
      return await parentResolve(resolvedSpecifier, context, defaultResolve)
    } else {
      Logger.log(`[AbsoluteResolve] assume specifier refers to a file without extension name: ${specifier}`)
      const EXPECTED_EXTENSIONS = ['.mts', '.cts', '.ts', '.tsx', '.mjs', '.cjs', '.js', '.jsx', '.json']
      const directoryOfSpecifier = path.dirname(specifier)
      if (!fs.existsSync(directoryOfSpecifier)) {
        Logger.log(`[AbsoluteResolve] directory of target path is unexpectedly not exist: ${directoryOfSpecifier}, when resolving absolute path: ${specifier}`)
        throw new Error(`[AbsoluteResolve] directory of target path is unexpectedly not exist: ${directoryOfSpecifier}, when resolving absolute path: ${specifier}`)
      } else {
        // returned filenames of fs.readdirSync are with extension name
        const files = fs.readdirSync(directoryOfSpecifier, { encoding: 'utf8' }).filter(filename => filename.startsWith(name))
        if (files.length === 0) {
          Logger.log(`[AbsoluteResolve] there is no file named "${name}" found in directory: ${directoryOfSpecifier}`)
          throw new Error(`[AbsoluteResolve] there is no file named "${name}" found in directory: ${directoryOfSpecifier}`)
        } else {
          const expectedExtension = EXPECTED_EXTENSIONS.find(extension => files.some(filename => filename.endsWith(extension)))
          const expectedFilename = expectedExtension === undefined ? files[0] : name + expectedExtension
          const resolvedSpecifier = path.join(directoryOfSpecifier, expectedFilename)
          Logger.log(`[AbsoluteResolve] pass handled specifier to main resolve: ${resolvedSpecifier}`)
          return await parentResolve(resolvedSpecifier, context, defaultResolve)
        }
      }
    }
  }
}
