import { differenceInSeconds } from 'date-fns'
import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from 'react'

import {
  addNewTimeEntryAction,
  markCurrentTimeEntryAction,
  pauseCurrentTimeEntryAction,
  playCurrentTimeEntryAction,
} from '@/reducers/time-entries/actions'
import { TimeEntriesReducer, TimeEntry } from '@/reducers/time-entries/reducer'

interface CreateTimeEntryData {
  task: string
  minutesAmount: number
  type: TimeEntry['type']
}

interface TimeEntriesContextData {
  TimeEntries: TimeEntry[]
  activeTimeEntry?: TimeEntry
  activeTimeEntryId: string | null
  amountSecondsPassed: number
  setSecondsPassed: (seconds: number) => void
  createNewTimeEntry: (data: CreateTimeEntryData) => void
  markCurrentTimeEntry: () => void
  pauseCurrentTimeEntry: () => void
  playCurrentTimeEntry: () => void
}

export const TimeEntriesContext = createContext({} as TimeEntriesContextData)

interface TimeEntriesContextProviderProps {
  children: ReactNode
}

export function TimeEntriesContextProvider({
  children,
}: TimeEntriesContextProviderProps) {
  const [TimeEntriesState, dispatch] = useReducer(
    TimeEntriesReducer,
    {
      TimeEntries: [],
      activeTimeEntryId: null,
    },
    (initialState) => {
      const storageStateAsJSON = localStorage.getItem(
        '@timelapse:time-entries-state-1.0.0',
      )

      if (storageStateAsJSON) {
        return JSON.parse(storageStateAsJSON)
      }

      return initialState
    },
  )
  const { TimeEntries, activeTimeEntryId } = TimeEntriesState
  const activeTimeEntry = TimeEntries.find(
    (timeEntry) => timeEntry.id === activeTimeEntryId,
  )

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    if (activeTimeEntry) {
      return differenceInSeconds(
        new Date(),
        new Date(activeTimeEntry.startDate),
      )
    }

    return 0
  })

  useEffect(() => {
    const stateJSON = JSON.stringify(TimeEntriesState)
    localStorage.setItem('@timelapse:time-entries-state-1.0.0', stateJSON)
  }, [TimeEntriesState])

  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  function markCurrentTimeEntry() {
    dispatch(markCurrentTimeEntryAction())
  }

  function pauseCurrentTimeEntry() {
    dispatch(pauseCurrentTimeEntryAction())
  }

  function playCurrentTimeEntry() {
    dispatch(playCurrentTimeEntryAction())
  }

  function createNewTimeEntry({
    minutesAmount,
    task,
    type,
  }: CreateTimeEntryData) {
    const newTimeEntry: TimeEntry = {
      id: String(new Date().getTime()),
      minutesAmount,
      task,
      type,
      status: 'running',
      startDate: new Date(),
    }

    dispatch(addNewTimeEntryAction(newTimeEntry))

    setSecondsPassed(0)
  }

  return (
    <TimeEntriesContext.Provider
      value={{
        TimeEntries,
        activeTimeEntry,
        activeTimeEntryId,
        amountSecondsPassed,
        markCurrentTimeEntry,
        pauseCurrentTimeEntry,
        playCurrentTimeEntry,
        setSecondsPassed,
        createNewTimeEntry,
      }}
    >
      {children}
    </TimeEntriesContext.Provider>
  )
}
