import { produce } from 'immer'

import { ActionTypes } from '@/reducers/time-entries/actions'

export interface TimeEntry {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptDate?: Date
  finishedDate?: Date
  status: 'running' | 'paused' | 'finished'
  type: 'increasing' | 'decreasing'
}

interface TimeEntriesState {
  TimeEntries: TimeEntry[]
  activeTimeEntryId: string | null
}

export type AddNewTimeEntryAction = {
  type: ActionTypes.ADD_NEW_TIMEENTRY
  payload: {
    newTimeEntry: TimeEntry
  }
}

export type MarkCurrentTimeEntryAction = {
  type: ActionTypes.MARK_NEW_TIMEENTRY
}

export type PauseCurrentTimeEntryAction = {
  type: ActionTypes.PAUSE_CURRENT_TIMEENTRY
}

export type PlayCurrentTimeEntryAction = {
  type: ActionTypes.PLAY_CURRENT_TIMEENTRY
}

type TimeEntriesAction =
  | AddNewTimeEntryAction
  | PauseCurrentTimeEntryAction
  | PlayCurrentTimeEntryAction
  | MarkCurrentTimeEntryAction

export function TimeEntriesReducer(
  state: TimeEntriesState,
  action: TimeEntriesAction,
) {
  switch (action.type) {
    case ActionTypes.ADD_NEW_TIMEENTRY:
      return produce(state, (draft) => {
        draft.TimeEntries.push(action.payload.newTimeEntry)
        draft.activeTimeEntryId = action.payload.newTimeEntry.id
      })
    case ActionTypes.MARK_NEW_TIMEENTRY: {
      // const currentTimeEntrieIndex = state.TimeEntries.findIndex(
      //   (timeEntry) => timeEntry.id === state.activeTimeEntryId,
      // )

      return state
      // Ajustar
    }
    case ActionTypes.PAUSE_CURRENT_TIMEENTRY: {
      const currentTimeEntryIndex = state.TimeEntries.findIndex(
        (timeEntry) => timeEntry.id === state.activeTimeEntryId,
      )

      if (currentTimeEntryIndex < 0) return state

      return produce(state, (draft) => {
        draft.TimeEntries[currentTimeEntryIndex].status = 'paused'
      })
    }
    case ActionTypes.PLAY_CURRENT_TIMEENTRY: {
      const currentTimeEntryIndex = state.TimeEntries.findIndex(
        (timeEntry) => timeEntry.id === state.activeTimeEntryId,
      )

      if (currentTimeEntryIndex < 0) return state

      return produce(state, (draft) => {
        draft.TimeEntries[currentTimeEntryIndex].status = 'running'
      })
    }
    default:
      return state
  }
}
