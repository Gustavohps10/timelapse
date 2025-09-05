import { IImportAddonUseCase } from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import { FileData } from '@timelapse/infra/contracts'
import { ViewModel } from '@timelapse/presentation/view-models'
import axios from 'axios'
import { IpcMainInvokeEvent } from 'electron'
import yaml from 'js-yaml'

import { AddonManifest } from '@/main/contracts/invokers/IAddonsInvoker'

const GITHUB_REPO = 'Gustavohps10/timelapse'
const GITHUB_PATH = 'src/packages/addonDatabase/dataSource'

export class AddonsHandler {
  constructor(private readonly importAddonService: IImportAddonUseCase) {}
  public async list(
    _event?: IpcMainInvokeEvent,
    _req?: IRequest,
  ): Promise<AddonManifest[]> {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`
    const { data: files } = await axios.get(url)

    const yamlFiles = files.filter((f: any) => f.name.endsWith('.yaml'))

    const addons: AddonManifest[] = await Promise.all(
      yamlFiles.map(async (file: any) => {
        const { data: rawYaml } = await axios.get(file.download_url)
        const doc = yaml.load(rawYaml) as any

        return {
          id: doc.AddonId,
          name: doc.Name,
          creator: doc.Author,
          description: doc.ShortDescription || doc.Description || '',
          path: file.path,
          logo: doc.IconUrl,
          downloads: 0,
          stars: 0,
          installed: false,
          installerManifestUrl: doc.InstallerManifestUrl,
          sourceUrl: doc.SourceUrl,
          tags: doc.Tags,
        } as AddonManifest
      }),
    )

    return addons
  }

  public async getById(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ addonId: string }>,
  ): Promise<AddonManifest> {
    const { addonId } = body

    const { data: files } = await axios.get(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
    )

    const file = files.find(
      (f: any) => f.name.includes(addonId) && f.name.endsWith('.yaml'),
    )
    if (!file) throw new Error('Addon não encontrado')

    const { data: rawYaml } = await axios.get(file.download_url)
    const doc = yaml.load(rawYaml) as any

    return {
      id: doc.AddonId,
      name: doc.Name,
      creator: doc.Author,
      description: doc.ShortDescription || doc.Description || '',
      path: file.path,
      logo: doc.IconUrl,
      downloads: 0,
      stars: 0,
      installed: false,
      installerManifestUrl: doc.InstallerManifestUrl,
      sourceUrl: doc.SourceUrl,
      tags: doc.Tags,
    } as AddonManifest
  }

  public async updateLocal(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<AddonManifest>,
  ): Promise<void> {
    console.log('Atualizar localmente:', body)
  }

  public async import(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<FileData>,
  ): Promise<ViewModel> {
    const result = await this.importAddonService.execute(body)

    if (result.failure) {
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
}
