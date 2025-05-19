import {
  AddNewTimeEntryAction,
  InterruptNewTimeEntryAction,
  MarkCurrentTimeEntryAsFinishedAction,
  TimeEntry,
} from '@/ui/reducers/time-entries/reducer'

export enum ActionTypes {
  ADD_NEW_TIMEENTRY = 'ADD_NEW_TIMEENTRY',
  INTERRUPT_NEW_TIMEENTRY = 'INTERRUPT_NEW_TIMEENTRY',
  MARK_CURRENT_TIMEENTRY_AS_FINISHED = 'MARK_CURRENT_TIMEENTRY_AS_FINISHED',
}

export function addNewTimeEntryAction(
  newTimeEntry: TimeEntry,
): AddNewTimeEntryAction {
  return {
    type: ActionTypes.ADD_NEW_TIMEENTRY,
    payload: {
      newTimeEntry,
    },
  }
}

export function markCurrentTimeEntryAsFinishedAction(): MarkCurrentTimeEntryAsFinishedAction {
  return {
    type: ActionTypes.MARK_CURRENT_TIMEENTRY_AS_FINISHED,
  }
}

export function interruptCurrentTimeEntryAction(): InterruptNewTimeEntryAction {
  return {
    type: ActionTypes.INTERRUPT_NEW_TIMEENTRY,
  }
}
