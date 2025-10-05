export const IpcChannels = {
  SYSTEM_VERSION: 'system:version',
  TASKS_LIST: 'tasks:list',

  GET_TOKEN: 'token',
  SAVE_TOKEN: 'token:save',
  DELETE_TOKEN: 'token:delete',

  LIST_TIME_ENTRIES: 'time-entries',
  TIME_ENTRIES_PULL: 'time-entries:pull',

  SET_HEADERS: 'set-headers',
  GET_HEADERS: 'get-headers',

  GET_CURRENT_USER: 'get-current-user',

  DISCORD_LOGIN: 'login:discord',

  WORKSPACES_CREATE: 'workspaces:create',
  WORKSPACES_GET_ALL: 'workspaces:get-all',
  WORKSPACES_GET_BY_ID: 'workspaces:get-by-id',
  WORKSPACES_GET_CONFIG_FIELDS: 'workspaces:fields',

  WORKSPACES_LINK_DATASOURCE: 'workspaces:link-datasource',
  WORKSPACES_UNLINK_DATASOURCE: 'workspaces:unlink-datasource',
  WORKSPACES_CONNECT_DATASOURCE: 'workspaces:connect-datasource',
  WORKSPACES_DISCONNECT_DATASOURCE: 'workspaces:disconnect-datasource',

  DATA_SOURCE_GET_FIELDS: 'datasource:get-fields',

  ADDONS_LIST: 'addons:list',
  ADDONS_GETINSTALLED_BY_ID: 'addons:getinstalled-by-id',
  ADDONS_GET_INSTALLER: 'addons:get-installer',
  ADDONS_UPDATE_LOCAL: 'addons:update-local',
  ADDONS_IMPORT: 'addons:import',
  ADDONS_INSTALL: 'addons:install',
} as const

export type IpcChannelType = keyof typeof IpcChannels
