export interface ISessionUser {
  id: string
  email?: string
  name: string
  role: 'admin' | 'user' | 'guest'
  locale?: string
  permissions?: string[]
}
