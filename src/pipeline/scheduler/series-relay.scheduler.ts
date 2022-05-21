import { Scheduler } from './base.scheduler'
import type {
  NumberedTacheGroup,
  InputOfTacheGroup, OutputOfTacheGroup
} from '../tache-group/index'

export type SeriesRelaySchedulerOutput<TG extends NumberedTacheGroup<any, any>> = OutputOfTacheGroup<TG>

export const seriesRelaySyncRun = <TG extends NumberedTacheGroup<any, any>> (
  tacheGroup: TG, input: InputOfTacheGroup<TG>
): SeriesRelaySchedulerOutput<TG> => {
  const sortedTachesInArray = tacheGroup.getSortedAllTachesInArray()

  const initInput = input
  // 顺序执行，每一个成员的执行结果会作为下一个成员的输入
  const finalOutput = sortedTachesInArray.reduce((lastOutput, currentTache) => {
    const result = currentTache.run(lastOutput)
    return result
  }, initInput)

  return finalOutput as SeriesRelaySchedulerOutput<TG>
}

export const seriesRelayAsyncRun = async <TG extends NumberedTacheGroup<any, any>> (
  tacheGroup: TG, input: InputOfTacheGroup<TG>
): Promise<SeriesRelaySchedulerOutput<TG>> => {
  const sortedTachesInArray = tacheGroup.getSortedAllTachesInArray()

  // 顺序执行，每一个成员的执行结果会作为下一个成员输入，由于包含异步成员，所以需要包装成 Promise 链式操作来保障执行顺序
  const initialPromise = Promise.resolve(input)
  const finalPromise = sortedTachesInArray.reduce(async (lastPromise, currentTache) => {
    void lastPromise.then(async (previous) => {
      return await Promise.resolve(currentTache.run(previous))
    })
    return await lastPromise
  }, initialPromise)
  const result = await (finalPromise as Promise<SeriesRelaySchedulerOutput<TG>>)

  return result
}

export class SeriesRelayScheduler<TG extends NumberedTacheGroup<any, any>> extends Scheduler<TG> {
  static syncRun <TG extends NumberedTacheGroup<any, any>> (
    tacheGroup: TG, input: InputOfTacheGroup<TG>
  ): SeriesRelaySchedulerOutput<TG> {
    return seriesRelaySyncRun(tacheGroup, input)
  }

  static async asyncRun <TG extends NumberedTacheGroup<any, any>> (
    tacheGroup: TG, input: InputOfTacheGroup<TG>
  ): Promise<SeriesRelaySchedulerOutput<TG>> {
    return await seriesRelayAsyncRun(tacheGroup, input)
  }

  syncRun (input: InputOfTacheGroup<TG>): SeriesRelaySchedulerOutput<TG> {
    return seriesRelaySyncRun(this.tacheGroup, input)
  }

  async asyncRun (input: InputOfTacheGroup<TG>): Promise<SeriesRelaySchedulerOutput<TG>> {
    return await seriesRelayAsyncRun(this.tacheGroup, input)
  }
}
