import { Task } from '@entities/Task'

import { IMutationBase } from '@/application/contracts/data/mutations/IMutationBase'

export interface ITaskMutation extends IMutationBase<Task> {}
