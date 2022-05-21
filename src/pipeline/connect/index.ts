import type { Phase } from '../phase/index'

export type AnyPhaseDict = Record<string, Phase<any, any>>

/**
 * Connect one phase as successor to another phase.
 * You will get the successor as return to add more successors to it.
 */
export function connectOneOne <FormerInput = any, FormerOutput = any, SuccessorOutput = any> (
  former: Phase<FormerInput, FormerOutput>, successor: Phase<FormerOutput, SuccessorOutput>
): Phase<FormerOutput, SuccessorOutput> {
  former.addSuccessor(successor)
  return successor
}

/**
 * Connect multiple phases as successors to one phase.
 * You will get the successors in dict as return to add more successors to them.
 */
export function connectOneMulti <FormerInput = any, FormerOutput = any> (
  former: Phase<FormerInput, FormerOutput>, successors: Record<string, Phase<FormerOutput, any>>
): Record<string, Phase<FormerOutput, any>>
export function connectOneMulti <FormerInput = any, FormerOutput = any> (
  former: Phase<FormerInput, FormerOutput>, successors: Array<Phase<FormerOutput, any>>
): Record<string, Phase<FormerOutput, any>>
export function connectOneMulti <FormerInput = any, FormerOutput = any> (
  former: Phase<FormerInput, FormerOutput>, successors: Record<string, Phase<FormerOutput, any>> | Array<Phase<FormerOutput, any>>
): Record<string, Phase<FormerOutput, any>> {
  if (Array.isArray(successors)) {
    former.addSuccessors(successors)
  } else {
    former.addSuccessors(Object.values(successors))
  }
  return former.getAllSuccessorsInDict()
}

/**
 * Connect multiple phases as successors to multiple phases, matches by the key of successor in dict to formers' name.
 * Key of phase in former dict should be the same as its name.
 * Key in successors' dict should be one of the keys of former dict, other keys will be ignored.
 */
export const connectMultiMulti = (
  formerDict: AnyPhaseDict, successorDict: AnyPhaseDict
): AnyPhaseDict => {
  Object.keys(formerDict).forEach((keyOrSaysFormerPhaseName) => {
    const formerPhase = formerDict[keyOrSaysFormerPhaseName]
    if (successorDict[keyOrSaysFormerPhaseName] !== undefined) {
      formerPhase.addSuccessor(successorDict[keyOrSaysFormerPhaseName])
    }
  })
  return Object.values(successorDict).reduce<AnyPhaseDict>((formattedSuccessorDict, successor) => {
    formattedSuccessorDict[successor.name] = successor
    return formattedSuccessorDict
  }, {})
}
