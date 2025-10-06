import {
  AddonInstallerDTO,
  AddonManifestDTO,
  IAddonsFacade,
} from '@timelapse/application'
import {
  AppError,
  Either,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '@timelapse/cross-cutting/helpers'
import axios from 'axios'
import { promises as fs } from 'fs'
import yaml from 'js-yaml'
import { join } from 'path'

const GITHUB_REPO = 'Gustavohps10/timelapse'
const GITHUB_PATH = 'src/packages/addonDatabase/dataSource'
const LOCAL_ADDONS_PATH = './addons/datasource'

type RawManifest = {
  AddonId?: string
  Version?: string
  Name?: string
  Author?: string
  ShortDescription?: string
  Description?: string
  IconUrl?: string
  SourceUrl?: string
  InstallerUrl?: string
  Tags?: string[]
}

type RawPackage = {
  Version?: string
  RequiredApiVersion?: string
  ReleaseDate?: string
  DownloadUrl?: string
  Changelog?: string[]
}

type RawInstaller = {
  AddonId?: string
  Packages?: RawPackage[]
}

export class AddonsFacade implements IAddonsFacade {
  public async listAvailable(): Promise<Either<AppError, AddonManifestDTO[]>> {
    try {
      const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`
      const { data: files } = await axios.get(url)

      const yamlFiles = (
        files as { name: string; download_url: string }[]
      ).filter((f) => f.name.endsWith('.yaml'))

      const addons: AddonManifestDTO[] = await Promise.all(
        yamlFiles.map(async (file) => {
          const { data: rawYaml } = await axios.get(file.download_url)
          const parsed = await this.parseManifest(rawYaml)
          if (parsed.isFailure()) throw parsed.failure
          return parsed.success
        }),
      )

      return Either.success(addons)
    } catch {
      return Either.failure(
        InternalServerError.danger('FAILED_TO_FETCH_ADDONS'),
      )
    }
  }

  public async listInstalled(): Promise<Either<AppError, AddonManifestDTO[]>> {
    try {
      const files = await fs.readdir(LOCAL_ADDONS_PATH)
      const installedAddons: AddonManifestDTO[] = []

      for (const folder of files) {
        const manifestPath = join(LOCAL_ADDONS_PATH, folder, 'manifest.yaml')
        try {
          const content = await fs.readFile(manifestPath)
          const manifestResult = await this.parseManifest(content)
          if (manifestResult.isSuccess()) {
            installedAddons.push({ ...manifestResult.success, installed: true })
          }
        } catch {
          continue
        }
      }

      return Either.success(installedAddons)
    } catch {
      return Either.failure(
        InternalServerError.danger('FAILED_TO_LIST_INSTALLED_ADDONS'),
      )
    }
  }

  public async getInstalledById(
    addonId: string,
  ): Promise<Either<AppError, AddonManifestDTO>> {
    const result = await this.listInstalled()
    if (result.isFailure()) return result.forwardFailure()

    const localAddonsList = result.success
    const addon = localAddonsList.find((a) => a.id === addonId)

    if (!addon)
      return Either.failure(NotFoundError.danger('LOCAL_ADDON_NOT_FOUND'))

    const localIconPath = `${LOCAL_ADDONS_PATH}/${addonId}/icon.png`

    try {
      const file = await fs.readFile(localIconPath)
      const base64 = `data:image/png;base64,${file.toString('base64')}`

      return Either.success({
        ...addon,
        logo: base64,
      })
    } catch (err) {
      return Either.failure(NotFoundError.danger('LOCAL_ADDON_ICON_NOT_FOUND'))
    }
  }

  public async getInstaller(
    installerUrl: string,
  ): Promise<Either<AppError, AddonInstallerDTO>> {
    try {
      const { data: rawYaml } = await axios.get(installerUrl)
      return this.parseInstaller(rawYaml)
    } catch {
      return Either.failure(
        InternalServerError.danger('FAILED_TO_FETCH_INSTALLER'),
      )
    }
  }

  public async parseManifest(
    fileContent: Buffer | string,
  ): Promise<Either<AppError, AddonManifestDTO>> {
    try {
      const doc = yaml.load(fileContent.toString()) as RawManifest

      if (!doc.AddonId) {
        return Either.failure(NotFoundError.danger('ADDONID_NOT_FOUND'))
      }

      const addon: AddonManifestDTO = {
        id: doc.AddonId,
        version: doc.Version ?? '',
        name: doc.Name ?? '',
        creator: doc.Author ?? '',
        description: doc.ShortDescription ?? doc.Description ?? '',
        logo: doc.IconUrl ?? '',
        sourceUrl: doc.SourceUrl ?? '',
        tags: doc.Tags ?? [],
        installed: false,
        installerManifestUrl: doc.InstallerUrl,
        path: '',
        downloads: 0,
        stars: 1,
      }

      return Either.success(addon)
    } catch {
      return Either.failure(
        InternalServerError.danger('FAILED_TO_PARSE_MANIFEST'),
      )
    }
  }

  public async parseInstaller(
    fileContent: Buffer | string,
  ): Promise<Either<AppError, AddonInstallerDTO>> {
    try {
      const doc = yaml.load(fileContent.toString()) as RawInstaller

      if (!doc.AddonId) {
        return Either.failure(ValidationError.danger('INSTALLER_INVALID'))
      }

      const installer: AddonInstallerDTO = {
        id: doc.AddonId,
        packages: (doc.Packages ?? []).map((pkg) => ({
          version: pkg.Version ?? '',
          requiredApiVersion: pkg.RequiredApiVersion ?? '',
          releaseDate: pkg.ReleaseDate ?? '',
          downloadUrl: pkg.DownloadUrl ?? '',
          changelog: pkg.Changelog ?? [],
        })),
      }

      return Either.success(installer)
    } catch {
      return Either.failure(
        InternalServerError.danger('FAILED_TO_PARSE_INSTALLER'),
      )
    }
  }

  public async downloadFile(
    downloadUrl: string,
    onProgress?: (percent: number) => void,
  ): Promise<Either<AppError, Uint8Array>> {
    try {
      const response = await axios.get<ArrayBuffer>(downloadUrl, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = (progressEvent.loaded / progressEvent.total) * 100
            onProgress(percent)
          }
        },
      })

      return Either.success(new Uint8Array(response.data))
    } catch {
      return Either.failure(InternalServerError.danger('DOWNLOAD_FAILED'))
    }
  }
}
