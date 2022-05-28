//
// Types below are refer to: https://nodejs.org/api/esm.html#loaders
//

export interface ResolveHookContext {
  conditions: string[]
  importAssertions: Record<string, string>
  parentURL?: string | undefined
}
export interface ResolveHookResult {
  format?: 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm' | undefined | null
  url: string
}

/**
 * The `resolve` hook returns the resolved file URL for a given module specifier and parent URL,
 * and optionally its format (such as '`module`') as a hint to the `load` hook.
 * If a format is specified, the `load` hook is ultimately responsible for providing the final
 * `format` value (and it is free to ignore the hint provided by `resolve`);
 * if `resolve` provides a format, a custom `load` hook is required even if only to pass the value
 * to the Node.js default `load` hook.
 *
 * @param specifier The module specifier is the string in an `import` statement or `import()` expression,
 *                  and the parent URL is the URL of the module that imported this one,
 *                  or `undefined` if this is the main entry point for the application.
 * @param context The `conditions` property in `context` is an array of conditions for
 *                [package exports conditions](https://nodejs.org/api/packages.html#conditional-exports)
 *                that apply to this resolution request.
 *                They can be used for looking up conditional mappings elsewhere or to modify the list
 *                when calling the default resolution logic.
 *                The current [package exports conditions](https://nodejs.org/api/packages.html#conditional-exports)
 *                are always in the `context.conditions` array passed into the hook.
 *                To guarantee default Node.js module specifier resolution behavior when calling `defaultResolve`,
 *                the `context.conditions` array passed to it must include all elements of
 *                the `context.conditions` array originally passed into the `resolve` hook.
 */
export type ResolveHookOfESMLoader = (
  specifier: string, context: ResolveHookContext, defaultResolve: ResolveHookOfESMLoader
) => Promise<ResolveHookResult>

export interface LoadHookContext {
  format?: string | undefined | null
  importAssertions: Record<string, string>
}
export type LoadHookResult = {
  format: 'builtin' | 'commonjs'
} | {
  format: 'json' | 'module'
  source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array
} | {
  format: 'wasm'
  source: ArrayBuffer | SharedArrayBuffer | Uint8Array
}

export type LoadHookOfESMLoader = (
  url: string, context: LoadHookContext, defaultLoad: LoadHookOfESMLoader
) => Promise<LoadHookResult>

export interface GlobalPreloadHookUtilities {
  port: MessagePort
}
export type GlobalPreloadHookOfESMLoader = (utilities: GlobalPreloadHookUtilities) => string
