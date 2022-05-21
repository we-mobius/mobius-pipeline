import type { CommonTransformerOptions, CommonTransformerContexts } from '../transformer'
import type { Tache } from './base.tache'
import type { SyncTache } from './sync.tache'
import type { AsyncTache } from './async.tache'

export function runTache <Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
  tache: SyncTache<Input, Output, Options, Contexts>,
  input: Input,
  options?: Options,
  contexts?: Contexts
): Output
export function runTache <Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
  tache: AsyncTache<Input, Output, Options, Contexts>,
  input: Input,
  options?: Options,
  contexts?: Contexts
): Promise<Output>
export function runTache <Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
  tache: Tache<Input, Output, Options, Contexts>,
  input: Input,
  options: Options = {} as any,
  contexts: Contexts = {} as any
): Output | Promise<Output> {
  tache.setOptions(options)
  tache.setContexts(contexts)
  return tache.run(input)
}
