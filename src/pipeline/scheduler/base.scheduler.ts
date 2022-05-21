import type {
  TacheGroup,
  InputOfTacheGroup
} from '../tache-group/index'

export abstract class Scheduler<TG extends TacheGroup<any, any>> {
  tacheGroup: TG

  constructor (tacheGroup: TG) {
    this.tacheGroup = tacheGroup
  }

  isScheduler (): true { return true }

  setTacheGroup (tacheGroup: TG): this {
    this.tacheGroup = tacheGroup
    return this
  }

  abstract syncRun (input: InputOfTacheGroup<TG>): any
  abstract asyncRun (input: InputOfTacheGroup<TG>): any

  /**
   * If given tache group is sync, run it synchronously.
   * If given tache group is async, run it asynchronously.
   */
  run (input: InputOfTacheGroup<TG>): any {
    if (this.tacheGroup.isSync()) {
      return this.syncRun(input)
    } else {
      return this.asyncRun(input)
    }
  }
}

/**
 * Predicate whether the target is of type `Scheduler`.
 */
export function isScheduler <TG extends TacheGroup<any, any>> (target: Scheduler<TG>): target is Scheduler<TG>
export function isScheduler <TG extends TacheGroup<any, any>> (target: any): target is Scheduler<TG>
export function isScheduler (target: any): target is Scheduler<TacheGroup<any, any>> { return target?.isScheduler?.() }
