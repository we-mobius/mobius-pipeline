import {
  delimiter, sep,
  basename, dirname, extname, format, parse,
  isAbsolute,
  join, normalize, relative, resolve
} from 'node:path'
import { fileURLToPath } from 'node:url'
import { cwd, env, chdir } from 'node:process'

import type { FormatInputPathObject, ParsedPath } from 'node:path'

export const getCurrentFilePath = (importMeta: ImportMeta): string => {
  return importMeta.url !== undefined ? fileURLToPath(importMeta.url) : ''
}

export const getCurrentFileDirectory = (importMeta: ImportMeta): string => dirname(getCurrentFilePath(importMeta))

export const getCurrentFileFilename = (importMeta: ImportMeta): string => getPathFilename(getCurrentFilePath(importMeta))

/**
 * @example
 * ```
 * D:\Root\Files\CodeSpace\mobius-project-workspace\mobius-pipeline
 * ```
 */
export const getCurrentWorkingDirectory = (): string => cwd()

/**
 * @example
 * ```JavaScript
 * setCurrentWorkingDirectory('..')
 * setCurrentWorkingDirectory('./src')
 * setCurrentWorkingDirectory('/tmp')
 * ```
 */
export const setCurrentWorkingDirectory = (directoryPath: string): void => chdir(directoryPath)

/**
 * `;` for Windows, `:` for POSIX.
 */
export const getPathDelimiter = (): string => delimiter

/**
 * `\` on Windows, `/` on POSIX.
 */
export const getPathSeparator = (): string => sep

/**
 * @example
 * ```
 * ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
 * ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\node\\']
 * ```
 */
export const getEnvironmentPaths = (): string[] => (env.PATH ?? '').split(delimiter)

export const getPathBasename = (path: string): string => basename(path)

export const getPathDirname = (path: string): string => dirname(path)

export const getPathExtensionName = (path: string): string => extname(path)

export const getPathFilename = (path: string): string => basename(path, extname(path))

export const formatPath = (pathObject: FormatInputPathObject): string => format(pathObject)

export type ParseOutputPathObject = ParsedPath
export const parsePath = (path: string): ParseOutputPathObject => parse(path)

export const isAbsolutePath = (path: string): boolean => isAbsolute(path)

export const isRelativePath = (path: string): boolean => !isAbsolute(path)

export const joinPathSegments = (...pathSegment: string[]): string => join(...pathSegment)

export const normalizePath = (path: string): string => normalize(path)

export const getRelativePath = (from: string, to: string): string => relative(from, to)

export const getRelativePathFromCurrentWorkingDirectory = (to: string): string => relative(getCurrentWorkingDirectory(), to)

export const getRelativePathToCurrentWorkingDirectory = (from: string): string => relative(from, getCurrentWorkingDirectory())

export const resolvePathSegments = (...pathSegments: string[]): string => normalizePath(joinPathSegments(...pathSegments))

export const resolvePathSegmentsToRoot = (...pathSegments: string[]): string => resolve(...pathSegments)
