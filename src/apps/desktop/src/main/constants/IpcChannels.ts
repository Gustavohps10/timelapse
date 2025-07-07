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
} as const

export type IpcChannelType = keyof typeof IpcChannels
