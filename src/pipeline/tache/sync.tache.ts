import { TacheCreateOptions, Tache } from './base.tache'

import type { CommonTransformerOptions, CommonTransformerContexts, SyncTransformer } from '../transformer'

export interface SyncTacheCreateOptions<
  Input = any,
  Output = any,
  Options extends CommonTransformerOptions = CommonTransformerOptions,
  Contexts extends CommonTransformerContexts = CommonTransformerContexts
> extends TacheCreateOptions<Input, Output, Options, Contexts> {
  transformer: SyncTransformer<Input, Output, Options, Contexts>
}

export class SyncTache<
  Input = any,
  Output = any,
  Options extends CommonTransformerOptions = CommonTransformerOptions,
  Contexts extends CommonTransformerContexts = CommonTransformerContexts
> extends Tache<Input, Output, Options, Contexts> {
  transformer: SyncTransformer<Input, Output, Options, Contexts>

  constructor (createOptions: SyncTacheCreateOptions<Input, Output, Options, Contexts>) {
    const { name, transformer, options, contexts } = { ...{ options: {} as any, contexts: {} as any }, ...createOptions }
    super({ name, transformer, options, contexts })
    this.transformer = transformer
  }

  static of<Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
    transformer: SyncTransformer<Input, Output, Options, Contexts>
  ): SyncTache<Input, Output, Options, Contexts> {
    return new SyncTache({ transformer })
  }

  isSyncTache (): boolean { return true }
  isAsyncTache (): boolean { return false }

  run (input: Input): Output {
    return this.transformer(input, this.options, this.contexts)
  }
}

/**
 * Predicate whether the target is of type `SyncTache`.
 */
export function isSyncTache <Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
  target: Tache<Input, Output, Options, Contexts>
): target is SyncTache<Input, Output, Options, Contexts>
export function isSyncTache <Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
  target: any
): target is SyncTache<Input, Output, Options, Contexts>
export function isSyncTache (target: any): target is SyncTache {
  return target?.isSyncTache?.()
}
