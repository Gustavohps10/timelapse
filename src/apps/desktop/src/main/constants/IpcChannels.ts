export const IpcChannels = {
  LOGIN: 'auth:login',
  TASKS_LIST: 'tasks:list',

  GET_TOKEN: 'token',
  SAVE_TOKEN: 'token:save',
  DELETE_TOKEN: 'token:delete',

  LIST_TIME_ENTRIES: 'time-entries',

  SET_HEADERS: 'set-headers',
  GET_HEADERS: 'get-headers',

  GET_CURRENT_USER: 'get-current-user',

  DISCORD_LOGIN: 'login:discord',

  WORKSPACES_CREATE: 'workspaces:select',
  WORKSPACES_GET_CONFIG_FIELDS: 'workspaces:fields',
  WORKSPACES_GET_ALL: 'workspaces:getall',

  PLUGIN_GET_FIELDS: 'plugin:get-fields',
} as const

export type IpcChannelType = keyof typeof IpcChannels
