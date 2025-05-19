import { produce } from 'immer'

import { ActionTypes } from '@/ui/reducers/time-entries/actions'

export interface TimeEntry {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptDate?: Date
  finishedDate?: Date
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

export type InterruptNewTimeEntryAction = {
  type: ActionTypes.INTERRUPT_NEW_TIMEENTRY
}

export type MarkCurrentTimeEntryAsFinishedAction = {
  type: ActionTypes.MARK_CURRENT_TIMEENTRY_AS_FINISHED
}

type TimeEntriesAction =
  | AddNewTimeEntryAction
  | InterruptNewTimeEntryAction
  | MarkCurrentTimeEntryAsFinishedAction

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
    case ActionTypes.INTERRUPT_NEW_TIMEENTRY: {
      const currentTimeEntrieIndex = state.TimeEntries.findIndex(
        (TimeEntrie) => TimeEntrie.id === state.activeTimeEntryId,
      )

      if (currentTimeEntrieIndex < 0) return state

      return produce(state, (draft) => {
        draft.activeTimeEntryId = null
        draft.TimeEntries[currentTimeEntrieIndex].interruptDate = new Date()
      })
    }
    case ActionTypes.MARK_CURRENT_TIMEENTRY_AS_FINISHED: {
      const currentTimeEntrieIndex = state.TimeEntries.findIndex(
        (TimeEntrie) => TimeEntrie.id === state.activeTimeEntryId,
      )

      if (currentTimeEntrieIndex < 0) return state

      return produce(state, (draft) => {
        draft.activeTimeEntryId = null
        draft.TimeEntries[currentTimeEntrieIndex].finishedDate = new Date()
      })
    }
    default:
      return state
  }
}
