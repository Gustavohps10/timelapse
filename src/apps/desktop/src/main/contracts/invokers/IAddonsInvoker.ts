import { FileData } from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import { ViewModel } from '@timelapse/presentation/view-models'

export interface AddonManifest {
  id: string
  version: string
  name: string
  creator: string
  description: string
  path: string
  logo: string
  downloads: number
  stars: number
  installed: boolean
  installerManifestUrl?: string
  sourceUrl?: string
  tags?: string[]
}

export interface AddonInstaller {
  id: string
  packages: {
    version: string
    requiredApiVersion: string
    releaseDate: string
    downloadUrl: string
    changelog: string[]
  }[]
}

export interface IAddonsInvoker {
  list(): Promise<AddonManifest[]>
  getById(addonId: string): Promise<AddonManifest>
  updateLocal(addon: AddonManifest): Promise<void>
  import(payload: IRequest<{ addon: FileData }>): Promise<ViewModel>
  getInstaller(
    payload: IRequest<{ installerUrl: string }>,
  ): Promise<AddonInstaller>
  install(
    payload: IRequest<
      { downloadUrl: string } & { onProgress?: (progress: number) => void }
    >,
  ): Promise<ViewModel>
}
