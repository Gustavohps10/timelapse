import { FileData, IFileManager } from '@/contracts'
import { IImportAddonUseCase } from '@/contracts/use-cases'

export class ImportAddonService implements IImportAddonUseCase {
  constructor(private fileManager: IFileManager) {}

  async execute(fileData: FileData, fileName: string): Promise<void> {
    const tempPath = `./temp/${Date.now()}-${fileName}`

    await this.fileManager.writeFile(tempPath, fileData)

    const extractedFiles = await this.fileManager.unzipInMemory(
      await this.fileManager.readFile(tempPath),
    )

    for (const file of extractedFiles) {
      const finalPath = `./addons/${file.name}`
      await this.fileManager.writeFile(finalPath, file.content)
    }

    await this.fileManager.delete(tempPath)
  }
}
