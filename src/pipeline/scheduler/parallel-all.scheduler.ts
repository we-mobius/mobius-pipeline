import { Scheduler } from './base.scheduler'
import type {
  NamedTacheGroup,
  InputOfTacheGroup, OutputOfTacheGroup
} from '../tache-group/index'

export type ParallelAllSchedulerOutput<TG extends NamedTacheGroup<any, any>> = OutputOfTacheGroup<TG>

export const parallelAllSyncRun = <TG extends NamedTacheGroup<any, any>> (
  tacheGroup?: TG, input?: InputOfTacheGroup<TG>
): void => {
  throw new Error('ParallelAllScheduler is not support sync mode.')
}

export const parallelAllAsyncRun = async <TG extends NamedTacheGroup<any, any>> (
  tacheGroup: TG, input: InputOfTacheGroup<TG>
): Promise<ParallelAllSchedulerOutput<TG>> => {
  const tachesInArray = tacheGroup.getAllTachesInArray()
  const finalDict: Record<string, any> = {}

  const promises = tachesInArray.map(async tache => await Promise.resolve(tache.run(input)))
  void await Promise.all(promises).then(results => {
    results.forEach((result, index) => {
      const tacheName = tacheGroup.getIndexByTache(tachesInArray[index])
      if (tacheName !== undefined) {
        finalDict[tacheName] = result
      }
    })
  })

  return finalDict as ParallelAllSchedulerOutput<TG>
}

export class ParallelAllScheduler<TG extends NamedTacheGroup<any, any>> extends Scheduler<TG> {
  static syncRun <TG extends NamedTacheGroup<any, any>> (
    tacheGroup?: TG, input?: InputOfTacheGroup<TG>
  ): void {
    return parallelAllSyncRun(tacheGroup, input)
  }

  static async asyncRun <TG extends NamedTacheGroup<any, any>> (
    tacheGroup: TG, input: InputOfTacheGroup<TG>
  ): Promise<ParallelAllSchedulerOutput<TG>> {
    return await parallelAllAsyncRun(tacheGroup, input)
  }

  syncRun (input?: InputOfTacheGroup<TG>): void {
    return parallelAllSyncRun(this.tacheGroup, input)
  }

  async asyncRun (input: InputOfTacheGroup<TG>): Promise<ParallelAllSchedulerOutput<TG>> {
    return await parallelAllAsyncRun(this.tacheGroup, input)
  }
}
