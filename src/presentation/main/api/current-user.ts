export type LoginRequest = {
  username?: string
  password?: string
  key?: string
}

export type LoginResponse = {
  user: {
    id: number
    login: string
    admin: boolean
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

interface Credentials {
  params?: { key?: string }
  headers?: Record<string, string>
}

export async function CurrentUser({ username, password, key }: LoginRequest) {
  const credentials = getCredentials({ username, password, key })

  const { data } = await api.get<LoginResponse>(`/users/current.json`, {
    headers: credentials.headers,
    params: credentials.params,
  })

  return data
}

function getCredentials({
  username,
  password,
  key,
}: LoginRequest): Credentials {
  // Caso ja possua a key, utilize apenas ela
  if (key) {
    return {
      params: {
        key,
      },
    }
  }

  // Caso nao possua, tente utilizar basic auth
  const base64Auth = btoa(`${username}:${password}`)
  return {
    headers: {
      Authorization: `Basic ${base64Auth}`,
    },
  }
}
