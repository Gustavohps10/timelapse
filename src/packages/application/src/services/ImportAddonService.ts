import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { FileData, IFileManager } from '@/contracts'
import { IImportAddonUseCase } from '@/contracts/use-cases'

export class ImportAddonService implements IImportAddonUseCase {
  constructor(private fileManager: IFileManager) {}

  async execute(fileData: FileData): Promise<Either<AppError, void>> {
    try {
      // const tempPath = `./temp/${Date.now()}-${fileName}`
      const tempPath = `./temp/${Date.now()}-teste-fixo`

      await this.fileManager.writeFile(tempPath, fileData)

      const extractedFiles = await this.fileManager.unzipInMemory(
        await this.fileManager.readFile(tempPath),
      )

      for (const file of extractedFiles) {
        const finalPath = `./addons/${file.name}`

        console.log(finalPath)
        await this.fileManager.writeFile(finalPath, file.content)
      }

      await this.fileManager.delete(tempPath)
      return Either.success(undefined)
    } catch {
      return Either.failure(new AppError('NAO_FOI_POSSIVEL_IMPORTAR'))
    }
  }
}
