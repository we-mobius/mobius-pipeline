import { TacheGroupCreateOptions, TacheGroup } from './base.tache-group'

import type { Tache } from '../tache/index'
import type { AnyTacheDict } from './base.tache-group'
import type { NumberedTacheGroup } from './numbered.tache-group'

export interface NamedTacheGroupCreateOptions<
  GroupInput = any, GroupOutput = any
> extends TacheGroupCreateOptions<GroupInput, GroupOutput> {
  taches: AnyTacheDict
}
export class NamedTacheGroup<GroupInput = any, GroupOutput = any> extends TacheGroup<GroupInput, GroupOutput> {
  tacheMap: Map<string, Tache<any, any>>

  constructor (createOptions: NamedTacheGroupCreateOptions<GroupInput, GroupOutput>) {
    super(createOptions)

    const { taches } = createOptions
    this.tacheMap = new Map()
    this.addTachesFromDict(taches)
  }

  static fromDict <GroupInput, GroupOutput> (taches: AnyTacheDict): NamedTacheGroup<GroupInput, GroupOutput> {
    return new NamedTacheGroup({ taches })
  }

  isNumberedTacheGroup<I = GroupInput, O = GroupOutput>(): this is NumberedTacheGroup<I, O> { return false }
  isNamedTacheGroup<I = GroupInput, O = GroupOutput>(): this is NamedTacheGroup<I, O> { return true }

  // For more accurate type anotation.
  hasTache (index: string): boolean
  hasTache (tache: Tache<any, any>): boolean
  hasTache (indexOrTache: string | Tache<any, any>): boolean
  hasTache (indexOrTache: string | Tache<any, any>): boolean {
    return super.hasTache(indexOrTache)
  }

  getTache (index: string): Tache<any, any> | undefined { return super.getTache(index) }
  getAllTachesInDict (): AnyTacheDict {
    const tacheDict: AnyTacheDict = {}
    this.tacheMap.forEach((tache, key) => {
      tacheDict[key] = tache
    })
    return tacheDict
  }

  getIndexByTache (tache: Tache<any, any>): string | undefined {
    return super.getIndexByTache(tache) as unknown as string | undefined
  }

  addTache (index: string, tache: Tache<any, any>): this { return super.addTache(index, tache) }
  setTache (index: string, tache: Tache<any, any>): this { return super.setTache(index, tache) }
  removeTacheByIndex (index: string): this { return super.removeTacheByIndex(index) }

  addTachesFromDict (taches: AnyTacheDict): this {
    Object.keys(taches).forEach((index) => {
      this.addTache(index, taches[index])
    })
    return this
  }
}
