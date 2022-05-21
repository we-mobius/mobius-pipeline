import * as uuid from 'uuid'
import type { CommonTransformerOptions, CommonTransformerContexts, Transformer } from '../transformer'

export interface TacheCreateOptions<
  Input = any,
  Output = any,
  Options extends CommonTransformerOptions = CommonTransformerOptions,
  Contexts extends CommonTransformerContexts = CommonTransformerContexts
> {
  name?: string
  transformer: Transformer<Input, Output, Options, Contexts>
  options?: Options
  contexts?: Contexts
}
export abstract class Tache<
  Input = any,
  Output = any,
  Options extends CommonTransformerOptions = CommonTransformerOptions,
  Contexts extends CommonTransformerContexts = CommonTransformerContexts
> {
  name: string
  abstract transformer: Transformer<Input, Output, Options, Contexts>
  options: Options
  contexts: Contexts

  constructor (createOptions: TacheCreateOptions<Input, Output, Options, Contexts>) {
    const { name, transformer, options, contexts } = { ...{ options: {} as any, contexts: {} as any }, ...createOptions }
    this.name = name ?? uuid.v1()
    this.options = options
    this.contexts = contexts
  }

  isTache (): true { return true }
  abstract isSyncTache (): boolean
  abstract isAsyncTache (): boolean

  setName (name: string): this {
    this.name = name
    return this
  }

  setOptions (options: Options): this {
    this.options = options
    return this
  }

  setContexts (contexts: Contexts): this {
    this.contexts = contexts
    return this
  }

  abstract run (input: Input): Output | Promise<Output>
}

/**
 * Predicate whether the target is of type `Tache`.
 */
export function isTache <Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
  target: Tache<Input, Output, Options, Contexts>
): target is Tache<Input, Output, Options, Contexts>
export function isTache <Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> (
  target: any
): target is Tache<Input, Output, Options, Contexts>
export function isTache (target: any): target is Tache {
  return target?.isTache?.()
}

/**
 * Extract type of type variable `Input` from `Tache`.
 */
export type InputOfTache<T extends Tache<any, any, any, any>> = T extends Tache<infer V, any, any, any> ? V : never
/**
 * Extract type of type variable `Output` from `Tache`.
 */
export type OutputOfTache<T extends Tache<any, any, any, any>> = T extends Tache<any, infer R, any, any> ? R : never
/**
 * Extract type of type variable `Options` from `Tache`.
 */
export type OptionsOfTache<T extends Tache<any, any, any, any>> = T extends Tache<any, any, infer O, any> ? O : never
/**
 * Extract type of type variable `Contexts` from `Tache`.
 */
export type ContextsOfTache<T extends Tache<any, any, any, any>> = T extends Tache<any, any, any, infer C> ? C : never
