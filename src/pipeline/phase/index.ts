import * as uuid from 'uuid'
import { isPromise } from '../../utils/index'
import { TacheGroup } from '../tache-group/index'
import { Scheduler } from '../scheduler'

export type PhaseObserver<PhaseInput = any, PhaseOutput = any> = (output: PhaseOutput, phase: Phase<PhaseInput, PhaseOutput>) => void
export interface PhaseCreateOptions<PhaseInput = any, PhaseOutput = any> {
  name?: string
  tacheGroup: TacheGroup<PhaseInput, PhaseOutput>
  scheduler: Scheduler<TacheGroup<PhaseInput, PhaseOutput>>
  successors?: Array<Phase<PhaseOutput, any>>
}
export class Phase<PhaseInput = any, PhaseOutput = any> {
  name: string
  tacheGroup: TacheGroup<PhaseInput, PhaseOutput>
  scheduler: Scheduler<TacheGroup<PhaseInput, PhaseOutput>>
  successors: Map<string, Phase<PhaseOutput, any>>
  observers: Map<PhaseObserver<PhaseInput, PhaseOutput>, () => void>

  constructor (createOptions: PhaseCreateOptions<PhaseInput, PhaseOutput>) {
    const { name, tacheGroup, scheduler, successors } = createOptions

    this.name = name ?? uuid.v1()
    this.tacheGroup = tacheGroup
    this.scheduler = scheduler
    this.successors = new Map()
    this.observers = new Map()

    ;(successors ?? []).forEach((successor) => {
      this.successors.set(successor.name, successor)
    })
  }

  static of<PhaseInput = any, PhaseOutput = any> (
    createOptions: PhaseCreateOptions<PhaseInput, PhaseOutput>
  ): Phase<PhaseInput, PhaseOutput> {
    return new Phase(createOptions)
  }

  isPhase (): true { return true }

  isSync (): boolean {
    return this.tacheGroup.isSync() && this.getAllSuccessorsInArray().every(successor => successor.isSync())
  }

  isAsync (): boolean {
    return this.tacheGroup.isAsync() || this.getAllSuccessorsInArray().some(successor => successor.isAsync())
  }

  /**
   * Check if the target successor is exist in this phase.
   */
  hasSuccessor (name: string): boolean
  hasSuccessor (phase: Phase<PhaseOutput, any>): boolean
  hasSuccessor (phase: Phase<any, any>): boolean
  hasSuccessor (nameOrPhase: string | Phase<PhaseOutput, any>): boolean
  hasSuccessor (nameOrPhase: string | Phase<any, any>): boolean
  hasSuccessor (nameOrPhase: string | Phase<any, any>): boolean {
    if (typeof nameOrPhase === 'string') {
      const name = nameOrPhase
      return this.successors.has(name)
    } else {
      const phase = nameOrPhase
      return this.successors.has(phase.name)
    }
  }

  getAllSuccessorsInArray (): Array<Phase<PhaseOutput, any>> {
    return Array.from(this.successors.values())
  }

  getAllSuccessorsInDict (): Record<string, Phase<PhaseOutput, any>> {
    const successorDict: Record<string, Phase<PhaseOutput, any>> = {}
    this.successors.forEach((successor) => {
      successorDict[successor.name] = successor
    })
    return successorDict
  }

  /**
   * Get the successor by name.
   */
  getSuccessorByName (name: string): Phase<PhaseOutput, any> | undefined {
    return this.successors.get(name)
  }

  /**
   * Add target successor to this phase, if the successor is exist, do nothing.
   */
  addSuccessor (successor: Phase<PhaseOutput, any>): this
  addSuccessor (successor: Phase<any, any>): this
  addSuccessor (successor: Phase<any, any>): this {
    if (!this.hasSuccessor(successor)) {
      this.successors.set(successor.name, successor)
    }
    return this
  }

  addSuccessors (successors: Array<Phase<PhaseOutput, any>>): this {
    successors.forEach((successor) => {
      this.addSuccessor(successor)
    })
    return this
  }

  setSuccessor (successor: Phase<PhaseOutput, any>): this
  setSuccessor (successor: Phase<any, any>): this
  setSuccessor (successor: Phase<any, any>): this {
    this.successors.set(successor.name, successor)
    return this
  }

  removeSuccessorByName (name: string): this {
    this.successors.delete(name)
    return this
  }

  /**
   * Remove target successor from this phase, if the successor is not exist, do nothing.
   */
  removeSuccessor (successor: Phase<PhaseOutput, any>): this
  removeSuccessor (successor: Phase<any, any>): this
  removeSuccessor (successor: Phase<any, any>): this {
    if (this.hasSuccessor(successor)) {
      this.successors.delete(successor.name)
    }
    return this
  }

  observePhase (observer: PhaseObserver<PhaseInput, PhaseOutput>): this {
    if (!this.observers.has(observer)) {
      const unobserve = (): void => {
        this.observers.delete(observer)
      }
      this.observers.set(observer, unobserve)
    }
    return this
  }

  unobserve (observer: PhaseObserver<PhaseInput, PhaseOutput>): this {
    if (this.observers.has(observer)) {
      this.observers.get(observer)?.()
    }
    return this
  }

  unobserveAll (): this {
    this.observers.forEach((unobserve) => unobserve())
    return this
  }

  broadcastResult (output: PhaseOutput): void {
    setTimeout(() => {
      Array.from(this.observers.keys()).forEach((observer) => observer(output, this))
    }, 0)
  }

  runPhase (input: PhaseInput): any {
    const phasedResult = this.scheduler.setTacheGroup(this.tacheGroup).run(input)
    if (isPromise<any>(phasedResult)) {
      void phasedResult.then(output => {
        this.broadcastResult(output)
      })
    } else {
      this.broadcastResult(phasedResult)
    }
    return phasedResult
  }

  run (input: PhaseInput): void {
    const phasedResult = this.runPhase(input)
    if (isPromise(phasedResult)) {
      void phasedResult.then(output => {
        this.successors.forEach(successor => {
          successor.run(output as any)
        })
      })
    } else {
      this.successors.forEach(phase => phase.run(phasedResult))
    }
  }
}

/**
 * Predicate whether the target is of type `Phase`.
 */
export function isPhase <Input, Output> (target: Phase<Input, Output>): target is Phase<Input, Output>
export function isPhase <Input, Output> (target: any): target is Phase<Input, Output>
export function isPhase (target: any): target is Phase<any, any> { return target?.isPhase?.() }
