import { Scheduler } from './base.scheduler'
import type {
  NumberedTacheGroup,
  InputOfTacheGroup, OutputOfTacheGroup
} from '../tache-group/index'

export const JUMPED_SIGNAL = Symbol('jumped')

export type SeriesJumpSchedulerOutput<TG extends NumberedTacheGroup<any, any>> = OutputOfTacheGroup<TG> | typeof JUMPED_SIGNAL

export const seriesJumpSyncRun = <TG extends NumberedTacheGroup<any, any>> (
  tacheGroup: TG, input: InputOfTacheGroup<TG>
): SeriesJumpSchedulerOutput<TG> => {
  const sortedTachesInArray = tacheGroup.getSortedAllTachesInArray()
  let handled = false
  let result: SeriesJumpSchedulerOutput<TG> = JUMPED_SIGNAL
  // 顺序执行，当遇到第一个非 JUMPED_SIGNAL 的返回结果时，将其作为最终结果返回
  sortedTachesInArray.forEach(tache => {
    if (!handled) {
      result = tache.run(input)
      if (result !== JUMPED_SIGNAL) {
        handled = true
      }
    }
  })
  return result
}

export const seriesJumpAsyncRun = async <TG extends NumberedTacheGroup<any, any>> (
  tacheGroup: TG, input: InputOfTacheGroup<TG>
): Promise<SeriesJumpSchedulerOutput<TG>> => {
  const sortedTachesInArray = tacheGroup.getSortedAllTachesInArray()
  let handled = false
  let result: SeriesJumpSchedulerOutput<TG> = JUMPED_SIGNAL

  // 顺序执行，当遇到第一个非 JUMPED_SIGNAL 的返回结果时，将其作为最终结果返回
  // 由于包含异步成员，所以需要包装成 Promise 链式操作来保障执行顺序
  const initialPromise = Promise.resolve() as Promise<SeriesJumpSchedulerOutput<TG>>
  const finalPromise = sortedTachesInArray.reduce(async (lastPromise, currentTache) => {
    if (!handled) {
      return await lastPromise.then(async () => {
        result = await Promise.resolve(currentTache.run(input))
        if (result !== JUMPED_SIGNAL) {
          handled = true
        }
        return result
      })
    } else {
      return await lastPromise
    }
  }, initialPromise)
  await finalPromise

  return result
}

export class SeriesJumpScheduler<TG extends NumberedTacheGroup<any, any>> extends Scheduler<TG> {
  static syncRun <TG extends NumberedTacheGroup<any, any>> (
    tacheGroup: TG, input: InputOfTacheGroup<TG>
  ): SeriesJumpSchedulerOutput<TG> {
    return seriesJumpSyncRun(tacheGroup, input)
  }

  static async asyncRun <TG extends NumberedTacheGroup<any, any>> (
    tacheGroup: TG, input: InputOfTacheGroup<TG>
  ): Promise<SeriesJumpSchedulerOutput<TG>> {
    return await seriesJumpAsyncRun(tacheGroup, input)
  }

  syncRun (input: InputOfTacheGroup<TG>): SeriesJumpSchedulerOutput<TG> {
    return seriesJumpSyncRun(this.tacheGroup, input)
  }

  async asyncRun (input: InputOfTacheGroup<TG>): Promise<SeriesJumpSchedulerOutput<TG>> {
    return await seriesJumpAsyncRun(this.tacheGroup, input)
  }
}
