export const DataSources = {
  DATABASE: 'DATABASE',
  REDMINE: 'REDMINE',
} as const

export type DataSource = (typeof DataSources)[keyof typeof DataSources]
