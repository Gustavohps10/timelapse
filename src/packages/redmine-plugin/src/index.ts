import { Context, IConnector } from '@trackalize/connector-sdk'

import { configurationFieldGroups, credentialFieldGroups } from '@/configFields'
import { RedmineAuthenticationStrategy } from '@/RedmineAuthenticationStrategy'
import { RedmineMemberQuery } from '@/RedmineMemberQuery'
import { RedmineTaskMutation } from '@/RedmineTaskMutation'
import { RedmineTaskQuery } from '@/RedmineTaskQuery'
import { RedmineTimeEntryQuery } from '@/RedmineTimeEntryQuery'

const RedmineConnector: IConnector = {
  id: '@trackalize/redmine-plugin',
  dataSourceType: 'redmine',
  displayName: 'Redmine (Oficial)',
  configFields: {
    configuration: configurationFieldGroups,
    credentials: credentialFieldGroups,
  },

  // eslint-disable-next-line prettier/prettier
  getAuthenticationStrategy: (context: Context) => new RedmineAuthenticationStrategy(),
  getTaskQuery: (context: Context) => new RedmineTaskQuery(),
  getTimeEntryQuery: (context: Context) => new RedmineTimeEntryQuery(context),
  getMemberQuery: (context: Context) => new RedmineMemberQuery(context),
  getTaskMutation: (context: Context) => new RedmineTaskMutation(),
}

export default RedmineConnector
