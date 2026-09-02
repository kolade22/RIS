export type ExaminationStatus = 'registered' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
const transitions: Record<ExaminationStatus, readonly ExaminationStatus[]> = {
  registered: ['waiting', 'cancelled', 'no_show'], waiting: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'], completed: [], cancelled: [], no_show: []
}

export function canTransition(from: ExaminationStatus, to: ExaminationStatus): boolean { return transitions[from].includes(to) }

export function transitionExamination(from: ExaminationStatus, to: ExaminationStatus, reason?: string): ExaminationStatus {
  if (!canTransition(from, to)) throw new Error(`Invalid examination transition: ${from} -> ${to}`)
  if ((to === 'cancelled' || to === 'no_show') && !reason?.trim()) throw new Error(`A reason is required when marking an examination ${to}`)
  return to
}
