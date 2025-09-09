export interface ISystemInvoker {
  getAppVersion(): Promise<string>
}
