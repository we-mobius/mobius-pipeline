import type { EmptyInterface } from '../../@types'

export type CommonTransformerOptions = EmptyInterface
export type CommonTransformerContexts = EmptyInterface

export type SyncTransformer<Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> = (
  input: Input, options: Options, contexts: Contexts
) => Output
export type AsyncTransformer<Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> = (
  input: Input, options: Options, contexts: Contexts
) => Promise<Output>
export type Transformer<Input, Output, Options extends CommonTransformerOptions, Contexts extends CommonTransformerContexts> =
  SyncTransformer<Input, Output, Options, Contexts> | AsyncTransformer<Input, Output, Options, Contexts>

export type InputOfTransformer<T extends Transformer<any, any, any, any>> = T extends Transformer<infer I, any, any, any> ? I : never
export type OutputOfTransformer<T extends Transformer<any, any, any, any>> = T extends Transformer<any, infer O, any, any> ? O : never
export type OptionsOfTransformer<T extends Transformer<any, any, any, any>> = T extends Transformer<any, any, infer O, any> ? O : never
export type ContextsOfTransformer<T extends Transformer<any, any, any, any>> = T extends Transformer<any, any, any, infer C> ? C : never
