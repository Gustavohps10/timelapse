import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  type Parser, // Importa o tipo base
} from 'nuqs' // Importado de 'nuqs' (cliente)

import { flagConfig } from '@/config/flag'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'
import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers'
// import { z } from 'zod'

/**
 * 1. MUDANÇA: Em vez de chamar 'createSearchParamsCache' ou 'createParser',
 * nós apenas definimos o OBJETO de parsers que será usado
 * pelo 'parseUrl' (no cliente) ou 'parseServerSide' (no servidor).
 */
export const tasksSearchParamsParsers = {
  filterFlag: parseAsStringEnum(
    flagConfig.featureFlags.map((flag) => flag.value),
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<SyncTaskRxDBDTO>().withDefault([
    { id: 'updatedAt', desc: true },
  ]),
  title: parseAsString.withDefault(''),
  status: parseAsArrayOf(parseAsString).withDefault([]),
  priority: parseAsArrayOf(parseAsString).withDefault([]),
  estimatedHours: parseAsArrayOf(parseAsInteger).withDefault([]),
  createdAt: parseAsArrayOf(parseAsString).withDefault([]),

  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
}

/**
 * Helper para validar filtros (usado pelo Activities.tsx).
 * Adapte conforme sua necessidade.
 */
export function getValidFilters(
  filters: ReturnType<(typeof tasksSearchParamsParsers)['filters']['parse']>,
) {
  // Por enquanto, apenas retorna os filtros.
  return filters
}

// Helper type para extrair os tipos do objeto de parsers
type Parsers = typeof tasksSearchParamsParsers
type ParsedValues<T> = {
  [K in keyof T]: T[K] extends Parser<infer V> ? V : never
}

// 2. MUDANÇA: O tipo 'GetTasksSchema' agora é inferido do objeto de parsers
export type GetTasksSchema = ParsedValues<Parsers>

// export const createTaskSchema = z.object({
// ...
// })

// export const updateTaskSchema = z.object({
// ...
// })
