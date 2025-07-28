import { IWorkspacesRepository } from '@trackalize/application'
import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { DataSourceType, Workspace } from '@trackalize/domain'
import { promises as fs } from 'fs'
import path from 'path'

type PlainWorkspace = {
  _Workspace__id: string
  _Workspace__name: string
  _Workspace__dataSourceType: DataSourceType
  _Workspace__pluginId?: string
  _Workspace__config?: string
  _Workspace__createdAt: string
  _Workspace__updatedAt: string
}

export class JSONWorkspacesRepository implements IWorkspacesRepository {
  private readonly filePath: string

  constructor(storagePath: string) {
    this.filePath = path.join(storagePath, 'workspaces.json')
  }

  private async _readWorkspaces(): Promise<Workspace[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8')
      const plainWorkspaces: PlainWorkspace[] = JSON.parse(data)

      return plainWorkspaces.map(
        (p) =>
          new Workspace(
            p._Workspace__id,
            p._Workspace__name,
            p._Workspace__dataSourceType,
            new Date(p._Workspace__createdAt),
            new Date(p._Workspace__updatedAt),
            p._Workspace__pluginId,
            p._Workspace__config,
          ),
      )
    } catch {
      return []
    }
  }

  private async _writeWorkspaces(workspaces: Workspace[]): Promise<void> {
    console.log(this.filePath)
    const plainWorkspaces = workspaces.map((ws) => ({
      _Workspace__id: ws.id,
      _Workspace__name: ws.name,
      _Workspace__dataSourceType: ws.dataSourceType,
      _Workspace__pluginId: ws.pluginId,
      _Workspace__config: ws.config,
      _Workspace__createdAt: ws.createdAt.toISOString(),
      _Workspace__updatedAt: ws.updatedAt.toISOString(),
    }))
    await fs.writeFile(this.filePath, JSON.stringify(plainWorkspaces, null, 2))
  }

  public async findAll(): Promise<Either<AppError, Workspace[]>> {
    try {
      const workspaces = await this._readWorkspaces()
      return Either.success(workspaces)
    } catch (error: any) {
      return Either.failure(new AppError(error.message))
    }
  }

  public async findById(
    id: string,
  ): Promise<Either<AppError, Workspace | null>> {
    try {
      const workspaces = await this._readWorkspaces()
      const workspace = workspaces.find((ws) => ws.id === id) || null
      return Either.success(workspace)
    } catch (error: any) {
      return Either.failure(new AppError(error.message))
    }
  }

  public async exists(
    criteria: Partial<Workspace>,
  ): Promise<Either<AppError, boolean>> {
    try {
      const workspaces = await this._readWorkspaces()
      const exists = workspaces.some((ws) =>
        (Object.keys(criteria) as Array<keyof Workspace>).every(
          (key) => ws[key] === criteria[key],
        ),
      )
      return Either.success(exists)
    } catch (error: any) {
      return Either.failure(new AppError(error.message))
    }
  }

  public async create(workspace: Workspace): Promise<Workspace> {
    const workspaces = await this._readWorkspaces()
    const exists = workspaces.some((ws) => ws.id === workspace.id)
    if (exists) {
      throw new Error('Workspace com este ID já existe.')
    }
    workspaces.push(workspace)
    await this._writeWorkspaces(workspaces)
    return workspace
  }

  public async update(
    id: string,
    entity: Partial<Workspace>,
  ): Promise<Workspace | null> {
    const workspaces = await this._readWorkspaces()
    const index = workspaces.findIndex((ws) => ws.id === id)
    if (index === -1) {
      return null
    }

    const originalWorkspace = workspaces[index]
    const updatedWorkspace = Object.assign(originalWorkspace, entity)

    workspaces[index] = updatedWorkspace
    await this._writeWorkspaces(workspaces)
    return updatedWorkspace
  }

  public async delete(id: string): Promise<boolean> {
    const workspaces = await this._readWorkspaces()
    const initialLength = workspaces.length
    const filteredWorkspaces = workspaces.filter((ws) => ws.id !== id)

    if (initialLength === filteredWorkspaces.length) {
      return false // Nenhum item foi removido
    }

    await this._writeWorkspaces(filteredWorkspaces)
    return true
  }
}
