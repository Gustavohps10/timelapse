import { Task } from '@trackalize/domain'

import { IMutationBase } from '@/contracts/data/mutations/IMutationBase'

export interface ITaskMutation extends IMutationBase<Task> {}
