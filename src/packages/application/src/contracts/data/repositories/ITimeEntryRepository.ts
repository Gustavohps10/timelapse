import { TimeEntry } from '@timelapse/domain'

import { IRepositoryBase } from '@/contracts/data'

export interface ITimeEntryRepository extends IRepositoryBase<TimeEntry> {}
