import { register } from 'ts-node'
import { getCurrentWorkingDirectory } from '../context/index'

import type { CommonTransformerOptions, CommonTransformerContexts } from '../../pipeline/index'

export interface TypeScriptRunOptions {
  entry?: string
}
export const runTypeScriptTransformer = (
  runOptions: TypeScriptRunOptions, options: CommonTransformerOptions, contexts: CommonTransformerContexts
): void => {
  register({
    compiler: 'typescript',
    compilerHost: false,
    cwd: getCurrentWorkingDirectory(),
    emit: false,
    esm: true,
    experimentalReplAwait: true,
    experimentalResolver: false,
    experimentalSpecifierResolution: 'explicit',
    files: false,
    projectSearchDir: getCurrentWorkingDirectory(),
    swc: true,
    transpileOnly: true
  })
}
