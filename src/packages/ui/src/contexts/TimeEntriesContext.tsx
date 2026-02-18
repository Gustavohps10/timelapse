'use client'

import { differenceInSeconds, parseISO } from 'date-fns'
import React, { createContext, ReactNode, useEffect, useState } from 'react'

import { SyncTimeEntryRxDBDTO } from '@/db/schemas/time-entries-sync-schema'
import { useSyncStore } from '@/stores/syncStore'

interface CreateTimeEntryData {
  taskId: string
  activityId: string
  type: 'increasing' | 'decreasing' | 'manual'
  comments?: string
  userId?: string
}

interface TimeEntriesContextData {
  activeTimeEntry: SyncTimeEntryRxDBDTO | null
  amountSecondsPassed: number
  createNewTimeEntry: (data: CreateTimeEntryData) => Promise<void>
  pauseCurrentTimeEntry: () => Promise<void>
  playCurrentTimeEntry: () => Promise<void>
  stopCurrentTimeEntry: () => Promise<void>
  setSecondsPassed: (seconds: number) => void
}

export const TimeEntriesContext = createContext({} as TimeEntriesContextData)

export function TimeEntriesContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const db = useSyncStore((state) => state.db)

  const [activeTimeEntry, setActiveTimeEntry] =
    useState<SyncTimeEntryRxDBDTO | null>(null)

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  // ===========================
  // LOG DB INIT
  // ===========================
  useEffect(() => {
    console.log('[TimeEntries] DB changed:', db)
  }, [db])

  // ===========================
  // MONITORAMENTO REATIVO
  // ===========================
  useEffect(() => {
    if (!db) {
      console.log('[TimeEntries] DB not ready')
      return
    }

    console.log('[TimeEntries] Subscribing to active time entry...')

    const sub = db.timeEntries
      .findOne({
        selector: {
          timeStatus: { $in: ['running', 'paused'] },
          _deleted: false,
        },
      })
      .$.subscribe((doc) => {
        console.log('[TimeEntries] Reactive emission:', doc)

        if (doc) {
          const json = doc.toMutableJSON()
          console.log('[TimeEntries] Active entry JSON:', json)
          setActiveTimeEntry(json)
        } else {
          console.log('[TimeEntries] No active entry found')
          setActiveTimeEntry(null)
          setAmountSecondsPassed(0)
        }
      })

    return () => {
      console.log('[TimeEntries] Unsubscribing...')
      sub.unsubscribe()
    }
  }, [db])

  // ===========================
  // TICKER
  // ===========================
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (activeTimeEntry?.timeStatus === 'running') {
      console.log('[TimeEntries] Timer running...')
      interval = setInterval(() => {
        const start = parseISO(activeTimeEntry.startDate!)
        const seconds = differenceInSeconds(new Date(), start)

        const total = seconds + (activeTimeEntry.timeSpent || 0)

        console.log('[TimeEntries] Tick:', total)

        setAmountSecondsPassed(total)
      }, 1000)
    }

    if (activeTimeEntry?.timeStatus === 'paused') {
      console.log('[TimeEntries] Timer paused')
      setAmountSecondsPassed(activeTimeEntry.timeSpent || 0)
    }

    return () => {
      clearInterval(interval)
    }
  }, [activeTimeEntry])

  function setSecondsPassed(seconds: number) {
    console.log('[TimeEntries] setSecondsPassed:', seconds)
    setAmountSecondsPassed(seconds)
  }

  // ===========================
  // CREATE
  // ===========================
  async function createNewTimeEntry(data: CreateTimeEntryData) {
    try {
      if (!db) {
        console.log('[TimeEntries] createNewTimeEntry -> DB null')
        return
      }

      console.log('[TimeEntries] Creating new entry...')
      console.log('[TimeEntries] Data:', data)

      if (activeTimeEntry) {
        console.log('[TimeEntries] Stopping previous active entry...')
        await stopCurrentTimeEntry()
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      const newEntry: SyncTimeEntryRxDBDTO = {
        _id: id,
        id,
        _deleted: false,
        task: { id: data.taskId },
        activity: { id: data.activityId },
        user: { id: data.userId || 'local-user' },
        startDate: now,
        timeSpent: 0,
        timeStatus: 'running',
        type: data.type,
        comments: data.comments,
        createdAt: now,
        updatedAt: now,
      }

      console.log('[TimeEntries] Inserting document:', newEntry)

      const result = await db.timeEntries.insert(newEntry)

      console.log('[TimeEntries] Insert result:', result)
      console.log('[TimeEntries] Inserted JSON:', result.toMutableJSON())

      setSecondsPassed(0)

      const allDocs = await db.timeEntries.find().exec()
      console.log('[TimeEntries] All timeEntries after insert:', allDocs)
    } catch (error) {
      console.error('[TimeEntries] ERROR creating entry:', error)
    }
  }

  // ===========================
  // PAUSE
  // ===========================
  async function pauseCurrentTimeEntry() {
    try {
      if (!db || !activeTimeEntry) {
        console.log('[TimeEntries] pause -> missing db or active entry')
        return
      }

      console.log('[TimeEntries] Pausing entry:', activeTimeEntry._id)

      const doc = await db.timeEntries.findOne(activeTimeEntry._id).exec()

      console.log('[TimeEntries] pause findOne result:', doc)

      if (!doc) return

      const start = parseISO(activeTimeEntry.startDate!)
      const secondsSinceLastPlay = differenceInSeconds(new Date(), start)

      const patched = await doc.patch({
        timeStatus: 'paused',
        timeSpent: (activeTimeEntry.timeSpent || 0) + secondsSinceLastPlay,
        updatedAt: new Date().toISOString(),
      })

      console.log('[TimeEntries] pause patched:', patched)
    } catch (error) {
      console.error('[TimeEntries] ERROR pausing:', error)
    }
  }

  // ===========================
  // PLAY
  // ===========================
  async function playCurrentTimeEntry() {
    try {
      if (!db || !activeTimeEntry) {
        console.log('[TimeEntries] play -> missing db or active entry')
        return
      }

      console.log('[TimeEntries] Playing entry:', activeTimeEntry._id)

      const doc = await db.timeEntries.findOne(activeTimeEntry._id).exec()

      console.log('[TimeEntries] play findOne result:', doc)

      if (!doc) return

      const patched = await doc.patch({
        timeStatus: 'running',
        startDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      console.log('[TimeEntries] play patched:', patched)
    } catch (error) {
      console.error('[TimeEntries] ERROR playing:', error)
    }
  }

  // ===========================
  // STOP
  // ===========================
  async function stopCurrentTimeEntry() {
    try {
      if (!db || !activeTimeEntry) {
        console.log('[TimeEntries] stop -> missing db or active entry')
        return
      }

      console.log('[TimeEntries] Stopping entry:', activeTimeEntry._id)

      const doc = await db.timeEntries.findOne(activeTimeEntry._id).exec()

      console.log('[TimeEntries] stop findOne result:', doc)

      if (!doc) return

      const start = parseISO(activeTimeEntry.startDate!)

      const finalSeconds =
        activeTimeEntry.timeStatus === 'running'
          ? (activeTimeEntry.timeSpent || 0) +
            differenceInSeconds(new Date(), start)
          : activeTimeEntry.timeSpent

      const patched = await doc.patch({
        timeStatus: 'finished',
        endDate: new Date().toISOString(),
        timeSpent: finalSeconds,
        updatedAt: new Date().toISOString(),
      })

      console.log('[TimeEntries] stop patched:', patched)
    } catch (error) {
      console.error('[TimeEntries] ERROR stopping:', error)
    }
  }

  return (
    <TimeEntriesContext.Provider
      value={{
        activeTimeEntry,
        amountSecondsPassed,
        createNewTimeEntry,
        pauseCurrentTimeEntry,
        playCurrentTimeEntry,
        stopCurrentTimeEntry,
        setSecondsPassed,
      }}
    >
      {children}
    </TimeEntriesContext.Provider>
  )
}
