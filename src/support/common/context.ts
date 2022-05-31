import * as process from 'node:process'
import { getResponsibleMobiusConfig, DEFAULT_ESM_LOADER_CONFIG, mergeMobiusConfig } from './config'

import type { ESMLoaderConfig } from './config'

const [execPath, execFilePath, ...execArguments] = process.argv

export interface ESMLoaderContext {
  execPath: string
  execFilePath: string
  execArguments: string[]
  ESMLoaderConfig: ESMLoaderConfig
}

export const ESM_LOADER_CONTEXT: ESMLoaderContext = {
  execPath,
  execFilePath,
  execArguments,
  ESMLoaderConfig: mergeMobiusConfig(
    getResponsibleMobiusConfig(execFilePath)?.configValue?.ESMLoader ?? DEFAULT_ESM_LOADER_CONFIG,
    DEFAULT_ESM_LOADER_CONFIG
  )
}
