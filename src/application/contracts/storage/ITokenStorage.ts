export interface ITokenStorage {
  saveToken(service: string, account: string, token: string): Promise<void>
  getToken(service: string, account: string): Promise<string | null>
  deleteToken(service: string, account: string): Promise<void>
  hasToken(service: string, account: string): Promise<boolean>
  replaceToken(
    service: string,
    account: string,
    newToken: string,
  ): Promise<void>
}
