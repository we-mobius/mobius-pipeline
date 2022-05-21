import { Scheduler } from './base.scheduler'
import type {
  NamedTacheGroup,
  InputOfTacheGroup, OutputOfTacheGroup
} from '../tache-group/index'

export type ParallelAnySchedulerOutput<TG extends NamedTacheGroup<any, any>> = OutputOfTacheGroup<TG>

export const parallelAnySyncRun = <TG extends NamedTacheGroup<any, any>> (
  tacheGroup?: TG, input?: InputOfTacheGroup<TG>
): void => {
  throw new Error('ParallelAnyScheduler is not support sync mode.')
}

export const parallelAnyAsyncRun = async <TG extends NamedTacheGroup<any, any>> (
  tacheGroup: TG, input: InputOfTacheGroup<TG>
): Promise<ParallelAnySchedulerOutput<TG>> => {
  const tachesInArray = tacheGroup.getAllTachesInArray()
  const promises = tachesInArray.map(async tache => await Promise.resolve(tache.run(input)))
  return await Promise.any(promises)
}

export class ParallelAnyScheduler<TG extends NamedTacheGroup<any, any>> extends Scheduler<TG> {
  static syncRun <TG extends NamedTacheGroup<any, any>> (
    tacheGroup?: TG, input?: InputOfTacheGroup<TG>
  ): void {
    return parallelAnySyncRun(tacheGroup, input)
  }

  static async asyncRun <TG extends NamedTacheGroup<any, any>> (
    tacheGroup: TG, input: InputOfTacheGroup<TG>
  ): Promise<ParallelAnySchedulerOutput<TG>> {
    return await parallelAnyAsyncRun(tacheGroup, input)
  }

  syncRun (input?: InputOfTacheGroup<TG>): void {
    return parallelAnySyncRun(this.tacheGroup, input)
  }

  async asyncRun (input: InputOfTacheGroup<TG>): Promise<ParallelAnySchedulerOutput<TG>> {
    return await parallelAnyAsyncRun(this.tacheGroup, input)
  }
}
