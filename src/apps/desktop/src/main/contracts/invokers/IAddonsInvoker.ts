export interface AddonManifest {
  id: string
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

export interface IAddonsInvoker {
  list(): Promise<AddonManifest[]>
  getById(addonId: string): Promise<AddonManifest>
  updateLocal?(addon: AddonManifest): Promise<void>
}
