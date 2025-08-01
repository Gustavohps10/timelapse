import { IWorkspacesRepository, WorkspaceDTO } from '@trackalize/application'
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

  private async _readWorkspaces(): Promise<WorkspaceDTO[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8')
      const plainWorkspaces: PlainWorkspace[] = JSON.parse(data)

      return plainWorkspaces.map(
        (p): WorkspaceDTO => ({
          id: p._Workspace__id,
          name: p._Workspace__name,
          dataSourceType: p._Workspace__dataSourceType,
          createdAt: new Date(p._Workspace__createdAt),
          updatedAt: new Date(p._Workspace__updatedAt),
          pluginId: p._Workspace__pluginId,
          config: p._Workspace__config,
        }),
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

  public async findAll(): Promise<Either<AppError, WorkspaceDTO[]>> {
    try {
      const workspaces = await this._readWorkspaces()
      return Either.success(workspaces)
    } catch (error: any) {
      return Either.failure(new AppError(error.message))
    }
  }

  public async findById(
    id: string,
  ): Promise<Either<AppError, WorkspaceDTO | null>> {
    try {
      const workspaces = await this._readWorkspaces()
      const workspace = workspaces.find((ws) => ws.id === id) || null
      return Either.success(workspace)
    } catch (error: any) {
      return Either.failure(new AppError(error.message))
    }
  }

  public async exists(
    criteria: Partial<WorkspaceDTO>,
  ): Promise<Either<AppError, boolean>> {
    try {
      const workspaces = await this._readWorkspaces()
      const exists = workspaces.some((ws) =>
        (Object.keys(criteria) as Array<keyof WorkspaceDTO>).every(
          (key) => ws[key] === criteria[key],
        ),
      )
      return Either.success(exists)
    } catch (error: any) {
      return Either.failure(new AppError(error.message))
    }
  }

  public async create(workspace: Workspace): Promise<Workspace> {
    const dtos = await this._readWorkspaces()
    const workspaces = dtos.map(this._hydrateEntity.bind(this))

    workspaces.push(workspace)
    await this._writeWorkspaces(workspaces)
    return workspace
  }

  public async update(
    id: string,
    entity: Partial<Workspace>,
  ): Promise<Workspace | null> {
    const dtos = await this._readWorkspaces()
    const workspaces = dtos.map(this._hydrateEntity.bind(this))
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
    const dtos = await this._readWorkspaces()
    const workspaces = dtos.map(this._hydrateEntity.bind(this))
    const initialLength = workspaces.length
    const filteredWorkspaces = workspaces.filter((ws) => ws.id !== id)

    if (initialLength === filteredWorkspaces.length) {
      return false // Nenhum item foi removido
    }

    await this._writeWorkspaces(filteredWorkspaces)
    return true
  }

  private _hydrateEntity(dto: WorkspaceDTO): Workspace {
    const entity = new Workspace(
      dto.id,
      dto.name,
      dto.dataSourceType as DataSourceType,
      dto.updatedAt,
      dto.createdAt,
    )

    if (dto.pluginId && dto.config && dto.dataSourceType !== 'local') {
      try {
        entity.linkDataSource(
          dto.dataSourceType as DataSourceType,
          dto.pluginId,
          dto.config,
        )
      } catch {}
    }

    return entity
  }
}
