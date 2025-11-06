import {
  AddNewTimeEntryAction,
  MarkCurrentTimeEntryAction,
  PauseCurrentTimeEntryAction,
  PlayCurrentTimeEntryAction,
  TimeEntry,
} from '@/reducers/time-entries/reducer'

export enum ActionTypes {
  ADD_NEW_TIMEENTRY = 'ADD_NEW_TIMEENTRY',
  MARK_NEW_TIMEENTRY = 'MARK_NEW_TIMEENTRY',
  PAUSE_CURRENT_TIMEENTRY = 'PAUSE_CURRENT_TIMEENTRY',
  PLAY_CURRENT_TIMEENTRY = 'PLAY_CURRENT_TIMEENTRY',
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

export function pauseCurrentTimeEntryAction(): PauseCurrentTimeEntryAction {
  return {
    type: ActionTypes.PAUSE_CURRENT_TIMEENTRY,
  }
}

export function playCurrentTimeEntryAction(): PlayCurrentTimeEntryAction {
  return {
    type: ActionTypes.PLAY_CURRENT_TIMEENTRY,
  }
}

export function markCurrentTimeEntryAction(): MarkCurrentTimeEntryAction {
  return {
    type: ActionTypes.MARK_NEW_TIMEENTRY,
  }
}
