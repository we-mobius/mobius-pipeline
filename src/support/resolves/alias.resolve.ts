import * as path from 'node:path'
import * as fs from 'node:fs'
import type { ChildResolveHookOfESMLoader } from '../loaders'

const readJSONFileAsValue = (pathOfJSON: string): any => {
  const JSONString = fs.readFileSync(pathOfJSON, { encoding: 'utf8' })
  try {
    // eslint-disable-next-line no-eval
    return eval(`(${JSONString})`)
  } catch (error) {
    console.log(`[readJSONFileAsValue] failed: ${pathOfJSON}`)
    return undefined
  }
}

const isTopDirectory = (targetPath: string): boolean => {
  const normalizedTargetPath = path.normalize(targetPath)
  return normalizedTargetPath === path.dirname(normalizedTargetPath)
}

const findResponsibleFilePath = (targetPath: string, filename: string): string | undefined => {
  const normalizedTargetPath = path.normalize(targetPath)
  // 从目标文件所在目录开始，逐级上翻，直到找到一个目标文件名的文件
  if (normalizedTargetPath.endsWith('/') || normalizedTargetPath.endsWith('\\') || normalizedTargetPath.endsWith(path.sep)) {
    return findResponsibleFilePath(path.resolve(normalizedTargetPath, '__placeholder__'), filename)
  } else {
    const dirname = path.dirname(normalizedTargetPath)
    const assumedPackageJSONPath = path.resolve(dirname, filename)
    if (fs.existsSync(assumedPackageJSONPath)) {
      return assumedPackageJSONPath
    } else {
      // 已经是顶级目录了，没有找到就是没有
      if (isTopDirectory(normalizedTargetPath)) {
        return undefined
      } else {
        // 如果不是顶级目录，上翻一级
        return findResponsibleFilePath(dirname, filename)
      }
    }
  }
}

const findResponsibleTSConfigPath = (targetPath: string): string | undefined => {
  return findResponsibleFilePath(targetPath, 'tsconfig.json')
}
const findResponsibleJSConfigPath = (targetPath: string): string | undefined => {
  return findResponsibleFilePath(targetPath, 'jsconfig.json')
}
const findResponsiblePackageJSONFilePath = (targetPath: string): string | undefined => {
  return findResponsibleFilePath(targetPath, 'package.json')
}

interface AliasConfig {
  files: Record<string, string[]>
  directorys: Record<string, string[]>
}
const getResponsibleAliasConfig = (specifier: string): AliasConfig | undefined => {
  const tsConfigFilePath = findResponsibleTSConfigPath(specifier)
  let initialConfig: undefined | { baseUrl: string, paths: Record<string, string[]> }

  if (tsConfigFilePath !== undefined) {
    const tsConfigValue = readJSONFileAsValue(tsConfigFilePath)
    if (tsConfigValue?.compilerOptions?.paths !== undefined) {
      initialConfig = {
        baseUrl: path.resolve(path.dirname(tsConfigFilePath), tsConfigValue.compilerOptions.baseUrl ?? '.'),
        paths: tsConfigValue.compilerOptions.paths
      }
    }
  }

  if (initialConfig === undefined) {
    const jsConfigFilePath = findResponsibleJSConfigPath(specifier)
    if (jsConfigFilePath !== undefined) {
      const jsConfigValue = readJSONFileAsValue(jsConfigFilePath)
      if (jsConfigValue?.compilerOptions?.paths !== undefined) {
        initialConfig = {
          baseUrl: path.resolve(path.dirname(jsConfigFilePath), jsConfigValue.compilerOptions.baseUrl ?? '.'),
          paths: jsConfigValue.compilerOptions.paths
        }
      }
    }
  }

  const aliasConfig: AliasConfig = { files: {}, directorys: {} }

  if (initialConfig === undefined) {
    return undefined
  } else {
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
}

export const isAliasSpecifier = (specifier: string): boolean => {
  const normalizedSpecifier = path.normalize(specifier)
  const responsibleAliasConfig = getResponsibleAliasConfig(specifier)

  // 如果没有找到别名配置信息，则无法解析别名
  if (responsibleAliasConfig === undefined) {
    return false
  }

  // 检查是否属于文件别名
  if (Object.keys(responsibleAliasConfig.files).includes(normalizedSpecifier)) {
    return true
  } else {
    // 检查是否属于目录别名
    return Object.keys(responsibleAliasConfig.directorys).some(alias => normalizedSpecifier.startsWith(alias))
  }
}
export const resolveAliasSpecifier: ChildResolveHookOfESMLoader = async (specifier, context, defaultResolve, parentResolve) => {
  console.log('[ts-loader] resolve alias specifier: ', specifier)

  const responsibleAliasConfig = getResponsibleAliasConfig(specifier)
  if (responsibleAliasConfig === undefined) {
    throw new Error('[resolveAliasSpecifier] responsibleAliasConfig is not found.')
  }

  const normalizedSpecifier = path.normalize(specifier)
  const { files, directorys } = responsibleAliasConfig

  const fileAlias = Object.keys(files).find(alias => alias === normalizedSpecifier)
  if (fileAlias !== undefined) {
    const mappings = files[fileAlias]
    let index = 0
    try {
      return await parentResolve(mappings[index], context, defaultResolve)
    } catch (error) {
      index = index + 1
      if (index < mappings.length) {
        return await parentResolve(mappings[index], context, defaultResolve)
      } else {
        return await defaultResolve(specifier, context, defaultResolve)
      }
    }
  }

  const directoryAlias = Object.keys(directorys).find(alias => specifier.startsWith(alias))
  if (directoryAlias !== undefined) {
    const mappings = directorys[directoryAlias]
    let index = 0
    try {
      return await parentResolve(normalizedSpecifier.replace(directoryAlias, mappings[index]), context, defaultResolve)
    } catch (error) {
      index = index + 1
      if (index < mappings.length) {
        return await parentResolve(normalizedSpecifier.replace(directoryAlias, mappings[index]), context, defaultResolve)
      } else {
        return await defaultResolve(specifier, context, defaultResolve)
      }
    }
  }

  return await defaultResolve(specifier, context, defaultResolve)
}
