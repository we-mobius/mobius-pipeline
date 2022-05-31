import { readJSONFileAsValue, findResponsibleFilePath } from './utils'

export const findResponsibleTSConfigFilePath = (targetPath: string): string | undefined => {
  return findResponsibleFilePath(targetPath, ['tsconfig.json'])
}
export const findResponsibleJSConfigFilePath = (targetPath: string): string | undefined => {
  return findResponsibleFilePath(targetPath, ['jsconfig.json'])
}
export const findResponsiblePackageConfigFilePath = (targetPath: string): string | undefined => {
  return findResponsibleFilePath(targetPath, ['package.json'])
}
export const findResponsibleMobiusConfigFilePath = (targetPath: string): string | undefined => {
  return findResponsibleFilePath(targetPath, ['.mobius/mobius.config.json', 'mobius.config.json'])
}

interface ResponsibleConfig {
  targetPath: string
  configFilePath: string
  configValue: any
}
interface ResponsibleTSConfig extends ResponsibleConfig { }
export const getResponsibleTSConfig = (targetPath: string): ResponsibleTSConfig | undefined => {
  const tsConfigFilePath = findResponsibleTSConfigFilePath(targetPath)
  if (tsConfigFilePath === undefined) {
    return undefined
  } else {
    return {
      targetPath: targetPath,
      configFilePath: tsConfigFilePath,
      configValue: readJSONFileAsValue(tsConfigFilePath)
    }
  }
}

interface ResponsibleJSConfig extends ResponsibleConfig { }
export const getResponsibleJSConfig = (targetPath: string): ResponsibleJSConfig | undefined => {
  const jsConfigFilePath = findResponsibleJSConfigFilePath(targetPath)
  if (jsConfigFilePath === undefined) {
    return undefined
  } else {
    return {
      targetPath: targetPath,
      configFilePath: jsConfigFilePath,
      configValue: readJSONFileAsValue(jsConfigFilePath)
    }
  }
}

interface ResponsiblePackageConfig extends ResponsibleConfig { }
export const getResponsiblePackageConfig = (targetPath: string): ResponsiblePackageConfig | undefined => {
  const packageJSONFilePath = findResponsiblePackageConfigFilePath(targetPath)
  if (packageJSONFilePath === undefined) {
    return undefined
  } else {
    return {
      targetPath: targetPath,
      configFilePath: packageJSONFilePath,
      configValue: readJSONFileAsValue(packageJSONFilePath)
    }
  }
}

export interface ESMLoaderConfig {
  debug: boolean
  traceResolve: boolean
}
interface ResponsibleMobiusConfig extends ResponsibleConfig {
  configValue: { ESMLoader: ESMLoaderConfig } & Record<string, any>
}
export const DEFAULT_ESM_LOADER_CONFIG: ESMLoaderConfig = {
  debug: false,
  traceResolve: false
}
export const getResponsibleMobiusConfig = (targetPath: string): ResponsibleMobiusConfig | undefined => {
  const mobiusConfigFilePath = findResponsibleMobiusConfigFilePath(targetPath)
  if (mobiusConfigFilePath === undefined) {
    return undefined
  } else {
    return {
      targetPath: targetPath,
      configFilePath: mobiusConfigFilePath,
      configValue: readJSONFileAsValue(mobiusConfigFilePath)
    }
  }
}
/**
 * `from` takes precedence over `to`.
 */
export const mergeMobiusConfig = (from: Partial<ESMLoaderConfig>, to: ESMLoaderConfig): ESMLoaderConfig => {
  return { ...to, ...from }
}
