import { ICredentialsStorage } from '@trackalize/application/contracts'
import keytar from 'keytar'

export class KeytarTokenStorage implements ICredentialsStorage {
  async saveToken(
    service: string,
    account: string,
    token: string,
  ): Promise<void> {
    await keytar.setPassword(service, account, token)
  }

  async getToken(service: string, account: string): Promise<string | null> {
    try {
      return keytar.getPassword(service, account)
    } catch {
      return null
    }
  }

  async deleteToken(service: string, account: string): Promise<void> {
    await keytar.deletePassword(service, account)
  }

  async hasToken(service: string, account: string): Promise<boolean> {
    const token = await this.getToken(service, account)
    return token !== null
  }

  async replaceToken(
    service: string,
    account: string,
    newToken: string,
  ): Promise<void> {
    await this.saveToken(service, account, newToken)
  }
}
