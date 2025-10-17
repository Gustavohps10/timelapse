import { Context, IConnector } from '@timelapse/sdk'

import { configurationFieldGroups, credentialFieldGroups } from '@/configFields'
import { RedmineAuthenticationStrategy } from '@/RedmineAuthenticationStrategy'
import { RedmineMemberQuery } from '@/RedmineMemberQuery'
import { RedmineTaskQuery } from '@/RedmineTaskQuery'
import { RedmineTaskRepository } from '@/RedmineTaskRepository'
import { RedmineTimeEntryQuery } from '@/RedmineTimeEntryQuery'
import { RedmineTimeEntryRepository } from '@/RedmineTimeEntryRepository'

const RedmineConnector: IConnector = {
  id: '@timelapse/redmine-plugin',
  dataSourceType: 'redmine',
  displayName: 'Redmine (Oficial)',
  configFields: {
    configuration: configurationFieldGroups,
    credentials: credentialFieldGroups,
  },

  /* eslint-disable */
  getAuthenticationStrategy: (context: Context) => new RedmineAuthenticationStrategy(),
  getTaskQuery: (context: Context) => new RedmineTaskQuery(context),
  getTimeEntryQuery: (context: Context) => new RedmineTimeEntryQuery(context),
  getTimeEntryRepository: (context: Context) => new RedmineTimeEntryRepository(context),
  getMemberQuery: (context: Context) => new RedmineMemberQuery(context),
  getTaskRepository: (context: Context) => new RedmineTaskRepository(),
    /* eslint-enable */
}

export default RedmineConnector
