import {
  ConnectDataSourceService,
  CreateWorkspaceService,
  DisconnectDataSourceService,
  GetCurrentUserService,
  GetWorkspaceService,
  IAuthenticationStrategy,
  ICredentialsStorage,
  IMemberQuery,
  ITaskQuery,
  ITaskRepository,
  ITimeEntryQuery,
  IWorkspacesQuery,
  IWorkspacesRepository,
  LinkDataSourceService,
  ListTaskService,
  ListTimeEntriesService,
  ListWorkspacesService,
  SessionManager,
  UnlinkDataSourceService,
} from '@timelapse/application'
import { JwtService } from '@timelapse/infra/auth'
import { HttpClient } from '@timelapse/infra/http'
import { FileManager } from '@timelapse/infra/storage'
import { UnitOfWork } from '@timelapse/infra/workflow'
import {
  asClass,
  asValue,
  AwilixContainer,
  createContainer,
  Lifetime,
  Resolver,
} from 'awilix'

import { IServiceProvider } from '@/IServiceProvider'
import { ServiceProvider } from '@/ServiceProvider'

type Class<T = unknown> = new (...args: any[]) => T

/**
 * Interface para as dependências de plataforma que são fornecidas externamente.
 * Ela define as implementações concretas que são fixas para a plataforma em execução.
 */
export interface PlatformDependencies {
  credentialsStorage: ICredentialsStorage
  workspacesRepository: IWorkspacesRepository
  workspacesQuery: IWorkspacesQuery
}

/**
 * Representa o conjunto de dependências dinâmicas que um plugin fornece.
 * Será usado para registrar as implementações específicas de um plugin em um contêiner de escopo.
 * As propriedades são opcionais porque cada rota irá registrar apenas o que for necessário.
 */
export interface ConnectorDependencies {
  authenticationStrategy: IAuthenticationStrategy
  taskQuery: ITaskQuery
  memberQuery: IMemberQuery
  timeEntryQuery: ITimeEntryQuery
  taskRepository: ITaskRepository
}

/**
 * Implementação do Builder Pattern para configurar o contêiner Awilix de forma organizada.
 */
export class ContainerBuilder {
  private readonly container: AwilixContainer

  constructor() {
    this.container = createContainer({
      injectionMode: 'CLASSIC',
    })
  }

  /**
   * Registra as dependências de plataforma (globais e singletons).
   * @param deps As instâncias das dependências de plataforma.
   * @returns A própria instância do builder para encadeamento.
   */
  public addPlatformDependencies(deps: PlatformDependencies): this {
    this.container.register({
      credentialsStorage: asValue(deps.credentialsStorage),
      workspacesRepository: asValue(deps.workspacesRepository),
      workspacesQuery: asValue(deps.workspacesQuery),
    })
    return this
  }

  /**
   * Registra os serviços da camada de aplicação.
   */
  public addApplicationServices(): this {
    this.container.register({
      sessionManager: asClass(SessionManager).scoped(),
      listTasksService: asClass(ListTaskService).scoped(),
      listTimeEntriesService: asClass(ListTimeEntriesService).scoped(),
      getCurrentUserService: asClass(GetCurrentUserService).scoped(),
      createWorkspaceService: asClass(CreateWorkspaceService).scoped(),
      listWorkspacesService: asClass(ListWorkspacesService).scoped(),
      linkDataSourceService: asClass(LinkDataSourceService).scoped(),
      unlinkDataSourceService: asClass(UnlinkDataSourceService).scoped(),
      connectDataSourceService: asClass(ConnectDataSourceService).scoped(),
      disconnectDataSourceService: asClass(
        DisconnectDataSourceService,
      ).scoped(),
      getWorkspaceService: asClass(GetWorkspaceService),
    })
    return this
  }

  /**
   * Registra as dependências da camada de infraestrutura.
   */
  public addInfrastructure(): this {
    this.container.register({
      httpClient: asClass(HttpClient).transient(),
      jwtService: asClass(JwtService).scoped(),
      unitOfWork: asClass(UnitOfWork).scoped(),
      fileManager: asClass(FileManager).scoped(),
    })
    return this
  }

  /**
   * Registra um dicionário genérico de dependências.
   * Este método permite agrupar e registrar qualquer conjunto de resolvers, como Handlers ou outros módulos.
   * @param module Um objeto contendo os resolvers para o módulo de dependências.
   * @returns A própria instância do builder para encadeamento.
   */
  public addScoped<T extends Record<string, Class>>(module: T): this {
    const scopedModule = {} as {
      [K in keyof T]: Resolver<InstanceType<T[K]>>
    }

    for (const key in module) {
      const ClassRef = module[key]
      scopedModule[key] = asClass(ClassRef).scoped() as Resolver<
        InstanceType<T[typeof key]>
      >
    }

    this.container.register(scopedModule)
    return this
  }

  public addFromPath(pathOrFile: string): this {
    let normalizedPath =
      pathOrFile.endsWith('.ts') || pathOrFile.endsWith('.js')
        ? pathOrFile.replace(/[^/\\]+$/, '*')
        : pathOrFile.endsWith('/')
          ? `${pathOrFile}*`
          : `${pathOrFile}/*`

    normalizedPath = normalizedPath.replace('*', '{!index,*}')

    this.container.loadModules([normalizedPath], {
      formatName: 'camelCase',
      resolverOptions: {
        lifetime: Lifetime.SCOPED,
      },
    })

    return this
  }

  /**
   * Finaliza a construção e retorna o contêiner configurado.
   */
  public build(): IServiceProvider {
    console.log('Container principal construído e dependências registradas.')
    return new ServiceProvider(this.container)
  }
}
