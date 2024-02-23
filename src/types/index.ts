export interface SaveItemInter {
  id: string,
  name: string,
  dirName: string,
  location: string,
  createTime: string,
  isContainGame: boolean,
  autoBackupTime: number,
  historyBackupList: HistoryBackupListInter,
  isOnlyOverwrite: boolean
}

export interface HistoryBackupInter {
  createTime: string,
  note: string
}

export type SaveListInter = Array<SaveItemInter>;
export type HistoryBackupListInter = Array<HistoryBackupInter>;