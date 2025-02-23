import { api } from "../lib/axios.js"

export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  user: {
    id: number
    login: string
    firstname: string
    lastname: string
    created_on: string
    last_login_on: string
    api_key: string
    custom_fields: {
      id: number
      name: string
      value: string
    }[]
  }
}

export async function CurrentUser({ username, password }: LoginRequest) {
  const base64Auth = btoa(`${username}:${password}`)

  const { data } = await api.get<LoginResponse>(`/users/current.json`, {
    headers: {
      'Authorization': `Basic ${base64Auth}`,
    },
  })

  return data
}
