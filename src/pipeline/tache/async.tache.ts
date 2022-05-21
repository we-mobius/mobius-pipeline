import { TacheCreateOptions, Tache } from './base.tache'

import type { CommonTransformerOptions, CommonTransformerContexts, AsyncTransformer } from '../transformer'

export interface AsyncTacheCreateOptions<
  Input = any,
  Output = any,
  Options extends CommonTransformerOptions = CommonTransformerOptions,
  Contexts extends CommonTransformerContexts = CommonTransformerContexts
> extends TacheCreateOptions<Input, Output, Options, Contexts> {
  transformer: AsyncTransformer<Input, Output, Options, Contexts>
}

export class AsyncTache<
  Input = any,
  Output = any,
  Options extends CommonTransformerOptions = CommonTransformerOptions,
  Contexts extends CommonTransformerContexts = CommonTransformerContexts
> extends Tache<Input, Output, Options, Contexts> {
  transformer: AsyncTransformer<Input, Output, Options, Contexts>

  constructor (createOptions: AsyncTacheCreateOptions<Input, Output, Options, Contexts>) {
    const { name, transformer, options, contexts } = { ...{ options: {} as any, contexts: {} as any }, ...createOptions }
    super({ name, transformer, options, contexts })
    this.transformer = transformer
  }

  static of<Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
    transformer: AsyncTransformer<Input, Output, Options, Contexts>
  ): AsyncTache<Input, Output, Options, Contexts> {
    return new AsyncTache({ transformer })
  }

  isSyncTache (): boolean { return false }
  isAsyncTache (): boolean { return true }

  async run (input: Input): Promise<Output> {
    return await this.transformer(input, this.options, this.contexts)
  }
}

/**
 * Predicate whether the target is of type `AsyncTache`.
 */
export function isAsyncTache <Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
  target: Tache<Input, Output, Options, Contexts>
): target is AsyncTache<Input, Output, Options, Contexts>
export function isAsyncTache <Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
  target: any
): target is AsyncTache<Input, Output>
export function isAsyncTache (target: any): target is AsyncTache {
  return target?.isAsyncTache?.()
}
