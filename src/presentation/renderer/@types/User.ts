export interface User {
  id: number
  login: string
  firstname: string
  lastname: string
  admin: boolean
  created_on: string
  last_login_on: string
  api_key: string
  custom_fields: { id: number; name: string; value: string }[]
}
