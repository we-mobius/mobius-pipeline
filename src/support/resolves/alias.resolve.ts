import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import { getResponsibleTSConfig, getResponsibleJSConfig } from '../common/config'
import { LoggerForResolve as Logger } from '../common/logger'

import type { ChildResolveHookOfESMLoader } from '../loaders'

interface AliasConfig {
  files: Record<string, string[]>
  directorys: Record<string, string[]>
}
const getResponsibleAliasConfig = (specifier: string): AliasConfig | undefined => {
  // Why don't extract `getResponsibleConfig` alone, cause `jsconfig` & `tsconfig` can be different.
  const responsibleTSConfig = getResponsibleTSConfig(specifier)
  let initialConfig: undefined | { baseUrl: string, paths: Record<string, string[]> }
  if (responsibleTSConfig !== undefined) {
    const { configFilePath, configValue } = responsibleTSConfig
    // @see https://www.typescriptlang.org/tsconfig#paths
    if (configValue?.compilerOptions?.paths !== undefined) {
      initialConfig = {
        baseUrl: path.resolve(path.dirname(configFilePath), configValue.compilerOptions.baseUrl ?? '.'),
        paths: configValue.compilerOptions.paths
      }
    }
  }
  if (initialConfig === undefined) {
    const responsibleJSConfig = getResponsibleJSConfig(specifier)
    if (responsibleJSConfig !== undefined) {
      const { configFilePath, configValue } = responsibleJSConfig
      if (configValue?.compilerOptions?.paths !== undefined) {
        initialConfig = {
          baseUrl: path.resolve(path.dirname(configFilePath), configValue.compilerOptions.baseUrl ?? '.'),
          paths: configValue.compilerOptions.paths
        }
      }
    }
  }

  const aliasConfig: AliasConfig = { files: {}, directorys: {} }
  if (initialConfig === undefined) {
    return undefined
  }
  const baseUrl = initialConfig.baseUrl
  const DIRECTORY_ALIAS_POSTFIX = '/*'
  Object.entries(initialConfig.paths).forEach(([alias, mappings]) => {
    if (alias.endsWith(DIRECTORY_ALIAS_POSTFIX)) {
      const normalizedAlias = path.normalize(alias.slice(0, -DIRECTORY_ALIAS_POSTFIX.length))
      aliasConfig.directorys[normalizedAlias] = aliasConfig.directorys[normalizedAlias] ?? []
      mappings.forEach(mapping => {
        const validMappingPath = path.join(baseUrl, mapping.slice(0, -DIRECTORY_ALIAS_POSTFIX.length))
        aliasConfig.directorys[normalizedAlias].push(validMappingPath)
      })
    } else {
      const normalizedAlias = path.normalize(alias)
      aliasConfig.files[normalizedAlias] = aliasConfig.files[normalizedAlias] ?? []
      mappings.forEach(mapping => {
        const validMappingPath = path.join(baseUrl, mapping)
        aliasConfig.files[normalizedAlias].push(validMappingPath)
      })
    }
  })
  return aliasConfig
}

export const isAliasSpecifier = (specifier: string): boolean => {
  const normalizedSpecifier = path.normalize(specifier)
  const responsibleAliasConfig = getResponsibleAliasConfig(specifier)

  // 如果没有找到别名配置信息，则无法解析别名
  if (responsibleAliasConfig === undefined) {
    return false
  }

  // 检查是否属于文件别名
  const fileAlias = Object.keys(responsibleAliasConfig.files).find(alias => alias === normalizedSpecifier)
  if (fileAlias !== undefined) {
    return true
  }
  // 检查是否属于目录别名
  const directoryAlias = Object.keys(responsibleAliasConfig.directorys).find(alias => normalizedSpecifier.startsWith(alias))
  if (directoryAlias !== undefined) {
    return true
  }

  return false
}
export const resolveAliasSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
  Logger.log(`[AliasResolve] enter: ${specifier}`)

  const responsibleAliasConfig = getResponsibleAliasConfig(specifier)
  if (responsibleAliasConfig === undefined) {
    Logger.log('[AliasResolve] responsible alias config is unexpectedly not found.')
    throw new Error('[AliasResolve] responsible alias config is unexpectedly not found.')
  }

  const normalizedSpecifier = path.normalize(specifier)
  const { files, directorys } = responsibleAliasConfig

  const fileAlias = Object.keys(files).find(alias => alias === normalizedSpecifier)
  if (fileAlias !== undefined) {
    Logger.log(`[AliasResolve] specifier hits file alias: ${fileAlias}`)
    const mappings = files[fileAlias]
    Logger.log(`[AliasResolve] ${mappings.length} file alias mappings found for ${fileAlias}`)
    let index = 0
    try {
      Logger.log(`[AliasResolve] try to resolve [${index + 1}/${mappings.length}] of mappings: ${mappings[index]}`)
      const resolvedSpecifier = mappings[index]
      Logger.log(`[AliasResolve] pass handled specifier to main resolve: ${resolvedSpecifier}`)
      return await parentResolve(resolvedSpecifier, context, defaultResolve)
    } catch (error) {
      index = index + 1
      if (index < mappings.length) {
        Logger.log(`[AliasResolve] try to resolve [${index + 1}/${mappings.length}] of mappings: ${mappings[index]}`)
        const resolvedSpecifier = mappings[index]
        Logger.log(`[AliasResolve] pass handled specifier to main resolve: ${resolvedSpecifier}`)
        return await parentResolve(mappings[index], context, defaultResolve)
      } else {
        Logger.log(`[AliasResolve] pass specifier to Node.js default resolve: ${specifier}`)
        // @see https://nodejs.org/api/errors.html#err_invalid_url
        const defaultResolveContext = {
          ...context, parentURL: context.parentURL !== undefined ? pathToFileURL(context.parentURL).href : undefined
        }
        Logger.log(`[AliasResolve] default resolve context: ${JSON.stringify(defaultResolveContext)}`)
        return await defaultResolve(specifier, defaultResolveContext, defaultResolve)
      }
    }
  }

  const directoryAlias = Object.keys(directorys).find(alias => specifier.startsWith(alias))
  if (directoryAlias !== undefined) {
    Logger.log(`[AliasResolve] specifier hits directoryAlias alias: ${directoryAlias}`)
    const mappings = directorys[directoryAlias]
    Logger.log(`[AliasResolve] ${mappings.length} directory alias mappings found for ${directoryAlias}`)
    let index = 0
    try {
      Logger.log(`[AliasResolve] try to resolve [${index + 1}/${mappings.length}] of mappings: ${mappings[index]}`)
      const resolvedSpecifier = normalizedSpecifier.replace(directoryAlias, mappings[index])
      Logger.log(`[AliasResolve] pass handled specifier to main resolve: ${resolvedSpecifier}`)
      return await parentResolve(resolvedSpecifier, context, defaultResolve)
    } catch (error) {
      index = index + 1
      if (index < mappings.length) {
        Logger.log(`[AliasResolve] try to resolve [${index + 1}/${mappings.length}] of mappings: ${mappings[index]}`)
        const resolvedSpecifier = normalizedSpecifier.replace(directoryAlias, mappings[index])
        Logger.log(`[AliasResolve] pass handled specifier to main resolve: ${resolvedSpecifier}`)
        return await parentResolve(resolvedSpecifier, context, defaultResolve)
      } else {
        Logger.log(`[AliasResolve] pass specifier to Node.js default resolve: ${specifier}`)
        // @see https://nodejs.org/api/errors.html#err_invalid_url
        const defaultResolveContext = {
          ...context, parentURL: context.parentURL !== undefined ? pathToFileURL(context.parentURL).href : undefined
        }
        Logger.log(`[AliasResolve] default resolve context: ${JSON.stringify(defaultResolveContext)}`)
        return await defaultResolve(specifier, defaultResolveContext, defaultResolve)
      }
    }
  }

  Logger.log(`[AliasResolve] pass specifier to Node.js default resolve: ${specifier}`)
  // @see https://nodejs.org/api/errors.html#err_invalid_url
  const defaultResolveContext = {
    ...context, parentURL: context.parentURL !== undefined ? pathToFileURL(context.parentURL).href : undefined
  }
  Logger.log(`[AliasResolve] default resolve context: ${JSON.stringify(defaultResolveContext)}`)
  return await defaultResolve(specifier, defaultResolveContext, defaultResolve)
}
