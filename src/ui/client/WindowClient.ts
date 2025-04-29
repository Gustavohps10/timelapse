import { IServices } from '@/presentation/interfaces'

export const WindowClient: IServices = {
  auth: window.api.services.auth,
  tasks: window.api.services.tasks,
}
