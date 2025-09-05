export type FileData =
  | Buffer
  | NodeJS.ReadableStream
  | ReadableStream<Uint8Array>

export interface IFileManager {
  readFile(filePath: string): Promise<FileData>
  writeFile(filePath: string, data: FileData): Promise<void>
  exists(filePath: string): Promise<boolean>
  delete(filePath: string): Promise<void>

  unzipInMemory(
    fileData: FileData,
  ): Promise<{ name: string; content: Buffer }[]>
  zip(
    files: { name: string; content: FileData }[],
    destinationPath?: string,
  ): Promise<Buffer>
}
