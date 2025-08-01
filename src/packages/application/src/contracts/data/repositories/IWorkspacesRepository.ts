import { Workspace } from '@trackalize/domain'

import { IMutationBase } from '@/contracts/data/mutations'
import { IQueryBase } from '@/contracts/data/queries'
import { WorkspaceDTO } from '@/dtos'

export interface IWorkspacesRepository
  extends IQueryBase<WorkspaceDTO>,
    IMutationBase<Workspace> {}
