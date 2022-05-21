import { TacheGroupCreateOptions, TacheGroup } from './base.tache-group'

import type { Tache } from '../tache/index'
import type { AnyTacheArray, AnyTacheDict } from './base.tache-group'
import type { NamedTacheGroup } from './named.tache-group'

export interface NumberedTacheGroupCreateOptions<
  GroupInput = any, GroupOutput = any
> extends TacheGroupCreateOptions<GroupInput, GroupOutput> {
  taches: AnyTacheArray | AnyTacheDict
}
export class NumberedTacheGroup<GroupInput = any, GroupOutput = any> extends TacheGroup<GroupInput, GroupOutput> {
  tacheMap: Map<number, Tache<any, any>>

  constructor (createOptions: NumberedTacheGroupCreateOptions<GroupInput, GroupOutput>) {
    super(createOptions)
    this.tacheMap = new Map()
    const { taches } = createOptions
    if (Array.isArray(taches)) {
      this.addTachesFromArray(taches)
    } else {
      this.addTachesFromDict(taches)
    }
  }

  static fromArray <GroupInput, GroupOutput> (taches: AnyTacheArray): NumberedTacheGroup<GroupInput, GroupOutput> {
    return new NumberedTacheGroup({ taches })
  }

  static fromDict <GroupInput, GroupOutput> (taches: AnyTacheDict): NumberedTacheGroup<GroupInput, GroupOutput> {
    return new NumberedTacheGroup({ taches })
  }

  isNumberedTacheGroup<I = GroupInput, O = GroupOutput>(): this is NumberedTacheGroup<I, O> { return true }
  isNamedTacheGroup<I = GroupInput, O = GroupOutput>(): this is NamedTacheGroup<I, O> { return false }

  // For more accurate type anotation.
  hasTache (index: number): boolean
  hasTache (tache: Tache<any, any>): boolean
  hasTache (indexOrTache: number | Tache<any, any>): boolean
  hasTache (indexOrTache: number | Tache<any, any>): boolean {
    return super.hasTache(indexOrTache)
  }

  getTache (index: number): Tache<any, any> | undefined { return super.getTache(index) }
  getIndexByTache (tache: Tache<any, any>): number | undefined {
    return super.getIndexByTache(tache) as unknown as number | undefined
  }

  addTache (index: number, tache: Tache<any, any>): this { return super.addTache(index, tache) }
  setTache (index: number, tache: Tache<any, any>): this { return super.setTache(index, tache) }
  removeTacheByIndex (index: number): this { return super.removeTacheByIndex(index) }

  addTachesFromArray (taches: AnyTacheArray): this {
    taches.forEach((tache, index) => {
      this.addTache(index, tache)
    })
    return this
  }

  addTachesFromDict (taches: AnyTacheDict): this {
    Object.keys(taches).forEach((index) => {
      const indexInNumber = Number(index)
      if (Number.isInteger(indexInNumber)) {
        this.addTache(indexInNumber, taches[index])
      }
    })
    return this
  }
}
