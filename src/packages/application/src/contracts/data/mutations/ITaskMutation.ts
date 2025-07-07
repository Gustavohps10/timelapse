import { Task } from '@trackpoint/domain'

import { IMutationBase } from '@/contracts/data/mutations/IMutationBase'

export interface ITaskMutation extends IMutationBase<Task> {}
