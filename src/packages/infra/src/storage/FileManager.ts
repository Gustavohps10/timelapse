import archiver from 'archiver'
import fs from 'fs'
import { dirname } from 'path'
import unzipper from 'unzipper'

import { FileData, IFileManager } from '@/contracts'

export class FileManager implements IFileManager {
  async readFile(filePath: string): Promise<FileData> {
    return fs.createReadStream(filePath)
  }

  async writeFile(filePath: string, data: FileData): Promise<void> {
    await fs.promises.mkdir(dirname(filePath), { recursive: true })
    const writeStream = fs.createWriteStream(filePath)

    const handler = [
      Buffer.isBuffer(data) && (() => writeStream.end(data)),
      data instanceof Uint8Array && (() => writeStream.end(Buffer.from(data))),
      'pipe' in data &&
        (() => (data as NodeJS.ReadableStream).pipe(writeStream)),
    ].find(Boolean) as (() => void) | undefined

    if (!handler) throw new Error('Tipo de FileData não suportado para escrita')
    handler()

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
      'on' in data && (data as NodeJS.ReadableStream).on('error', reject)
    })
  }

  async exists(filePath: string): Promise<boolean> {
    return fs.promises
      .access(filePath)
      .then(() => true)
      .catch(() => false)
  }

  async delete(filePath: string): Promise<void> {
    await fs.promises.unlink(filePath)
  }

  private async toBuffer(content: FileData): Promise<Buffer> {
    if (Buffer.isBuffer(content)) return content
    if (content instanceof Uint8Array) return Buffer.from(content)
    if ('pipe' in content) {
      const chunks: Buffer[] = []
      return new Promise((resolve, reject) => {
        ;(content as NodeJS.ReadableStream)
          .on('data', (chunk) => chunks.push(chunk))
          .on('end', () => resolve(Buffer.concat(chunks)))
          .on('error', reject)
      })
    }

    const reader = (content as ReadableStream<Uint8Array>).getReader()
    const chunks: Uint8Array[] = []
    let done = false
    while (!done) {
      const result = await reader.read()
      done = result.done ?? false
      if (result.value) chunks.push(result.value)
    }
    return Buffer.concat(chunks.map((c) => Buffer.from(c)))
  }

  async unzipInMemory(
    fileData: FileData,
  ): Promise<{ name: string; content: Buffer }[]> {
    const buffer = await this.toBuffer(fileData)
    const directory = await unzipper.Open.buffer(buffer)
    const files: { name: string; content: Buffer }[] = []

    for (const file of directory.files) {
      if (!file.path.endsWith('/')) {
        files.push({ name: file.path, content: await file.buffer() })
      }
    }

    return files
  }

  async zip(
    files: { name: string; content: FileData }[],
    destinationPath?: string,
  ): Promise<Buffer> {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks: Buffer[] = []

    archive.on('data', (chunk) => chunks.push(chunk))
    const finalizePromise = new Promise<void>((resolve, reject) => {
      archive.on('end', resolve)
      archive.on('error', reject)
    })

    for (const { name, content } of files) {
      const bufferContent = await this.toBuffer(content)
      archive.append(bufferContent, { name })
    }

    archive.finalize()
    await finalizePromise

    const zipBuffer = Buffer.concat(chunks)
    if (destinationPath) {
      await fs.promises.mkdir(dirname(destinationPath), { recursive: true })
      await fs.promises.writeFile(destinationPath, zipBuffer)
    }
    return zipBuffer
  }
}
