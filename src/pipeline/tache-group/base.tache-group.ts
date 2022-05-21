import * as uuid from 'uuid'
import { Tache } from '../tache/index'
import { NumberedTacheGroup } from './numbered.tache-group'
import { NamedTacheGroup } from './named.tache-group'

export type AnyTacheArray = Array<Tache<any, any>>
export interface AnyTacheDict { [key: string | number | symbol]: Tache<any, any> }

export type InputOfTacheGroup<T extends TacheGroup<any, any>> = T extends TacheGroup<infer I, any> ? I : never
export type OutputOfTacheGroup<T extends TacheGroup<any, any>> = T extends TacheGroup<any, infer O> ? O : never

export interface TacheGroupCreateOptions<GroupInput = any, GroupOutput = any> {
  name?: string
}
export abstract class TacheGroup<GroupInput = any, GroupOutput = any> {
  name: string
  tacheMap: Map<string | number, Tache<any, any>>

  constructor (createOptions: TacheGroupCreateOptions<GroupInput, GroupOutput>) {
    const { name } = createOptions
    this.name = name ?? uuid.v1()
    this.tacheMap = new Map()
  }

  isTacheGroup <I = GroupInput, O = GroupOutput> (): this is TacheGroup<I, O> { return true }
  abstract isNumberedTacheGroup <I = GroupInput, O = GroupOutput> (): this is NumberedTacheGroup<I, O>
  abstract isNamedTacheGroup <I = GroupInput, O = GroupOutput> (): this is NamedTacheGroup<I, O>

  setName (name: string): this {
    this.name = name
    return this
  }

  /**
   * If all the members in this group are sync, this tache group is sync.
   */
  isSync (): boolean {
    return this.getAllTachesInArray().every(tache => tache.isSyncTache())
  }

  /**
   * If one of the member in this group is async, this tache group is async.
   */
  isAsync (): boolean {
    return this.getAllTachesInArray().some(tache => tache.isAsyncTache())
  }

  /**
   * Check if the target tache is exist in this tache group.
   */
  hasTache (indexOrTache: string | number | Tache<any, any>): boolean {
    if (typeof indexOrTache === 'string' || typeof indexOrTache === 'number') {
      return this.tacheMap.has(indexOrTache)
    } else {
      return this.getAllTachesInArray().some(tache => tache === indexOrTache)
    }
  }

  getTache (index: string | number): Tache<any, any> | undefined {
    return this.tacheMap.get(index)
  }

  getAllTachesInArray (): AnyTacheArray {
    return Array.from(this.tacheMap.values())
  }

  getSortedAllTachesInArray (): AnyTacheArray {
    const tacheEntries = [...this.tacheMap.entries()]
    const sortedTacheEntries = tacheEntries.sort(([a], [b]) => a < b ? -1 : (a === b ? 0 : 1))
    const sortedTaches = sortedTacheEntries.map(entry => entry[1])
    return sortedTaches
  }

  getIndexByTache (tache: Tache<any, any>): string | number | undefined {
    const tacheEntries = [...this.tacheMap.entries()]
    const targetTacheEntry = tacheEntries.find(([index, tacheInMap]) => tacheInMap === tache)
    if (targetTacheEntry !== undefined) {
      return targetTacheEntry[0]
    }
    return undefined
  }

  addTache (index: string | number, tache: Tache<any, any>): this {
    if (!this.tacheMap.has(index)) {
      this.tacheMap.set(index, tache)
    }
    return this
  }

  setTache (index: string | number, tache: Tache<any, any>): this {
    this.tacheMap.set(index, tache)
    return this
  }

  removeTacheByIndex (index: string | number): this {
    this.tacheMap.delete(index)
    return this
  }

  removeTache (tache: Tache<any, any>): this {
    const tacheIndex = this.getIndexByTache(tache)
    if (tacheIndex !== undefined) {
      this.removeTacheByIndex(tacheIndex)
    }
    return this
  }
}
