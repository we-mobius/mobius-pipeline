import { Scheduler } from './base.scheduler'
import type {
  NumberedTacheGroup,
  InputOfTacheGroup, OutputOfTacheGroup
} from '../tache-group/index'

export type SeriesPassbySchedulerOutput<TG extends NumberedTacheGroup<any, any>> = OutputOfTacheGroup<TG>

export const seriesPassbySyncRun = <TG extends NumberedTacheGroup<any, any>> (
  tacheGroup: TG, input: InputOfTacheGroup<TG>
): SeriesPassbySchedulerOutput<TG> => {
  const sortedTachesInArray = tacheGroup.getSortedAllTachesInArray()
  // 同步执行：成员都是同步函数，挨个调用即可
  sortedTachesInArray.forEach(tache => {
    tache.run(input)
  })
  return input
}

export const seriesPassbyAsyncRun = async <TG extends NumberedTacheGroup<any, any>> (
  tacheGroup: TG, input: InputOfTacheGroup<TG>
): Promise<SeriesPassbySchedulerOutput<TG>> => {
  const sortedTachesInArray = tacheGroup.getSortedAllTachesInArray()

  // 异步执行：成员包含异步函数，将所有成员串联成 Promise 链式运行以保障执行顺序
  const initialPromise = Promise.resolve()
  const finalPromise = sortedTachesInArray.reduce(async (lastPromise, currentTache) => {
    void lastPromise.then(async () => await Promise.resolve(currentTache.run(input)))
    return await lastPromise
  }, initialPromise)
  await finalPromise

  return input
}

export class SeriesPassbyScheduler<TG extends NumberedTacheGroup<any, any>> extends Scheduler<TG> {
  static syncRun <TG extends NumberedTacheGroup<any, any>> (
    tacheGroup: TG, input: InputOfTacheGroup<TG>
  ): SeriesPassbySchedulerOutput<TG> {
    return seriesPassbySyncRun(tacheGroup, input)
  }

  static async asyncRun <TG extends NumberedTacheGroup<any, any>> (
    tacheGroup: TG, input: InputOfTacheGroup<TG>
  ): Promise<SeriesPassbySchedulerOutput<TG>> {
    return await seriesPassbyAsyncRun(tacheGroup, input)
  }

  syncRun (input: InputOfTacheGroup<TG>): SeriesPassbySchedulerOutput<TG> {
    return seriesPassbySyncRun(this.tacheGroup, input)
  }

  async asyncRun (input: InputOfTacheGroup<TG>): Promise<SeriesPassbySchedulerOutput<TG>> {
    return await seriesPassbyAsyncRun(this.tacheGroup, input)
  }
}
