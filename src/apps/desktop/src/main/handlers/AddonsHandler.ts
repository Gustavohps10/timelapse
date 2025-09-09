import {
  AddonInstallerDTO,
  FileData,
  IAddonsFacade,
  IImportAddonUseCase,
} from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import { ViewModel } from '@timelapse/presentation/view-models'
import { IpcMainInvokeEvent } from 'electron'

import { AddonManifest } from '@/main/contracts/invokers/IAddonsInvoker'

export class AddonsHandler {
  constructor(
    private readonly importAddonService: IImportAddonUseCase,
    private readonly addonsFacade: IAddonsFacade,
  ) {}

  public async list(
    _event?: IpcMainInvokeEvent,
    _req?: IRequest,
  ): Promise<AddonManifest[]> {
    const [availableResult, installedResult] = await Promise.all([
      this.addonsFacade.listAvailable(),
      this.addonsFacade.listInstalled(),
    ])

    if (availableResult.isFailure()) {
      return []
    }

    const installedIds: string[] = installedResult.isSuccess()
      ? installedResult.success.map((i) => i.id)
      : []

    return availableResult.success.map((a) => ({
      id: a.id,
      version: a.version,
      name: a.name,
      creator: a.creator,
      description: a.description,
      path: a.path || '',
      logo: a.logo,
      downloads: a.downloads ?? 0,
      stars: a.stars ?? 0,
      installed: installedIds.includes(a.id),
      installerManifestUrl: a.installerManifestUrl,
      sourceUrl: a.sourceUrl,
      tags: a.tags,
    }))
  }

  public async getById(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ addonId: string }>,
  ): Promise<AddonManifest | null> {
    const result = await this.addonsFacade.getById(body.addonId)
    if (result.isFailure()) {
      return null
    }

    const installedResult = await this.addonsFacade.listInstalled()
    const installedIds: string[] = installedResult.isSuccess()
      ? installedResult.success.map((i) => i.id)
      : []

    const a = result.success
    return {
      id: a.id,
      version: a.version,
      name: a.name,
      creator: a.creator,
      description: a.description,
      path: a.path || '',
      logo: a.logo,
      downloads: a.downloads ?? 0,
      stars: a.stars ?? 0,
      installed: installedIds.includes(a.id),
      sourceUrl: a.sourceUrl,
      tags: a.tags,
    }
  }

  public async getInstaller(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ installerUrl: string }>,
  ): Promise<AddonInstallerDTO | null> {
    const result = await this.addonsFacade.getInstaller(body.installerUrl)

    if (result.isFailure()) {
      return null
    }

    return result.success
  }

  public async updateLocal(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<AddonManifest>,
  ): Promise<void> {
    if (!body?.id) {
      throw new Error('INVALID_ADDON_MANIFEST')
    }

    console.log('Update local addon info:', body)
  }

  public async import(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ addon: FileData }>,
  ): Promise<ViewModel> {
    const result = await this.importAddonService.execute(body.addon)

    if (result.isFailure()) {
      return {
        isSuccess: false,
        error: result.failure.messageKey,
        statusCode: result.failure.statusCode,
      }
    }

    return {
      isSuccess: true,
      statusCode: 200,
    }
  }

  public async install(
    _event: IpcMainInvokeEvent,
    {
      body,
    }: IRequest<{
      downloadUrl: string
      onProgress?: (progress: number) => void
    }>,
  ): Promise<ViewModel> {
    try {
      // === DOWNLOAD (70%) ===
      const downloadResult = await this.addonsFacade.downloadFile(
        body.downloadUrl,
        (p) => body.onProgress?.(p * 0.7), // normaliza para 70%
      )

      if (downloadResult.isFailure()) {
        return {
          isSuccess: false,
          error: downloadResult.failure.messageKey,
          statusCode: 500,
        }
      }

      const fileData = downloadResult.success

      // === IMPORTAÇÃO / EXTRAÇÃO (30%) ===
      body.onProgress?.(70) // início da segunda fase
      const result = await this.importAddonService.execute(fileData)
      body.onProgress?.(100) // finalizado

      if (result.isFailure()) {
        return {
          isSuccess: false,
          error: result.failure.messageKey,
          statusCode: result.failure.statusCode,
        }
      }

      return { isSuccess: true, statusCode: 200 }
    } catch (err) {
      console.error('Addon install failed:', err)
      return { isSuccess: false, error: 'INSTALL_FAILED', statusCode: 500 }
    }
  }
}
