import axios from 'axios'
import { shell } from 'electron'

import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

let authPromise: {
  resolve: (code: string) => void
  reject: (error: Error) => void
} | null = null

export function handleUrlCallback(url: string): void {
  if (authPromise && url.startsWith('atask://auth/discord/callback')) {
    try {
      const code = new URL(url).searchParams.get('code')
      const errorDescription = new URL(url).searchParams.get(
        'error_description',
      )

      if (code) {
        authPromise.resolve(code)
      } else {
        authPromise.reject(
          new Error(errorDescription || 'Autorização negada pelo usuário.'),
        )
      }
    } catch {
      authPromise.reject(new Error('URL de callback inválida ou malformada.'))
    } finally {
      authPromise = null
    }
  }
}

async function exchangeCodeAndGetUser(code: string) {
  const CLIENT_ID = '1389613844694962249'
  const CLIENT_SECRET = 'DVgJzAHtsmi4pqbWbjGTCTFVggGXy77L'
  const REDIRECT_URI = 'atask://auth/discord/callback'

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  })

  const tokenResponse = await axios.post(
    'https://discord.com/api/oauth2/token',
    params,
  )
  const accessToken = tokenResponse.data.access_token

  const userResponse = await axios.get('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return userResponse.data
}

export async function handleDiscordLogin(): Promise<Either<AppError, any>> {
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=1389613844694962249&redirect_uri=atask%3A%2F%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=identify`

  try {
    shell.openExternal(authUrl)

    const code = await new Promise<string>((resolve, reject) => {
      authPromise = { resolve, reject }
    })

    const discordUser = await exchangeCodeAndGetUser(code)
    const { id, avatar, username } = discordUser

    if (!id || !avatar) {
      return Either.failure(
        new AppError('AVATAR_NOT_FOUND', 'Usuário não possui um avatar.', 404),
      )
    }

    const avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`

    return Either.success({ data: { avatarUrl, username } })
  } catch (error) {
    return Either.failure(
      new AppError('DISCORD_AUTH_FAILED', (error as Error).message, 500),
    )
  }
}
