import { Workspace } from '@trackalize/domain'

import { IMutationBase } from '@/contracts/data/mutations'
import { IQueryBase } from '@/contracts/data/queries'

export interface IWorkspacesRepository
  extends IQueryBase<Workspace>,
    IMutationBase<Workspace> {}
