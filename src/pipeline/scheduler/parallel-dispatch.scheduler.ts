import { Scheduler } from './base.scheduler'
import type {
  NamedTacheGroup,
  InputOfTacheGroup
} from '../tache-group/index'

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type ParallelDispatchSchedulerOutput = void

export const parallelDispatchSyncRun = <TG extends NamedTacheGroup<any, any>> (
  tacheGroup?: TG, input?: InputOfTacheGroup<TG>
): ParallelDispatchSchedulerOutput => {
  throw new Error('ParallelDispatchScheduler is not support sync mode.')
}

export const parallelDispatchAsyncRun = async <TG extends NamedTacheGroup<any, any>> (
  tacheGroup: TG, input: InputOfTacheGroup<TG>
): Promise<ParallelDispatchSchedulerOutput> => {
  const tachesInArray = tacheGroup.getAllTachesInArray()
  // Tache Group 成员中既包含同步成员也包含异步成员，异步成员直接运行即可，同步成员放在异步逻辑中运行，避免阻塞
  // TODO: tache 的同步异步判别函数并没有正确收窄类型
  tachesInArray.forEach(tache => {
    if (tache.isAsyncTache()) {
      void tache.run(input)
    } else if (tache.isSyncTache()) {
      setTimeout(() => {
        tache.run(input)
      }, 0)
    } else {
      throw new Error('Unknown tache type.')
    }
  })
}

export class ParallelDispatchScheduler<TG extends NamedTacheGroup<any, any>> extends Scheduler<TG> {
  static syncRun <TG extends NamedTacheGroup<any, any>> (
    tacheGroup?: TG, input?: InputOfTacheGroup<TG>
  ): ParallelDispatchSchedulerOutput {
    return parallelDispatchSyncRun(tacheGroup, input)
  }

  static async asyncRun <TG extends NamedTacheGroup<any, any>> (
    tacheGroup: TG, input: InputOfTacheGroup<TG>
  ): Promise<ParallelDispatchSchedulerOutput> {
    return await parallelDispatchAsyncRun(tacheGroup, input)
  }

  syncRun (input?: InputOfTacheGroup<TG>): ParallelDispatchSchedulerOutput {
    return parallelDispatchSyncRun(this.tacheGroup, input)
  }

  async asyncRun (input: InputOfTacheGroup<TG>): Promise<ParallelDispatchSchedulerOutput> {
    return await parallelDispatchAsyncRun(this.tacheGroup, input)
  }
}
