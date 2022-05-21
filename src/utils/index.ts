/**
 * @see {@link Array.isArray}
 */
export function isArray <T> (target: T[]): target is T[]
export function isArray <T> (target: any): target is T[]
export function isArray (target: any): target is any[] { return Array.isArray(target) }

// eslint-disable-next-line @typescript-eslint/ban-types
export const isAsyncFunction = (tar: any): tar is Function =>
  Object.prototype.toString.call(tar) === '[object AsyncFunction]'

export function isPromise <T> (target: Promise<T>): target is Promise<T>
export function isPromise <T> (target: any): target is Promise<T>
export function isPromise (target: any): target is Promise<any> {
  return Object.prototype.toString.call(target) === '[object Promise]'
}
