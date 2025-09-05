import { FileData } from '@/contracts/infra'

export interface IImportAddonUseCase {
  execute(fileData: FileData, fileName: string): Promise<void>
}
