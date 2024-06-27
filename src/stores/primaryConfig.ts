import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { type SaveListInter, type SaveItemInter, type HistoryBackupInter } from '../types/index';

export const usePrimaryConfigStore = defineStore('primaryConfig', {
  state: () => ({
    mainConfig: {
      themeColor: 'primary',
      saveFolder: '',
      autoBackupTime: 0
    },
    dateTimeFlag: null as Date | null,
    saveList: [] as SaveListInter,
    globalSnackBarText: '' as string,
    globalSnackBar: false as boolean
  }),
  actions: {
    addSaveProfile(data: SaveItemInter) {
      data.id = nanoid();
      data.createTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

      this.saveList.unshift({...data});
    },
    addHistoryBackup(id: string | string[], data: HistoryBackupInter) {
      const targetIndex = this.saveList.findIndex(item => item.id === id);

      this.saveList[targetIndex].historyBackupList.unshift(data);
    },
    deleteSaveProfile(id: string | string[]) {
      const targetIndex = this.saveList.findIndex(item => item.id === id);
      this.saveList.splice(targetIndex, 1);
    },
    deleteHistoryBackup(id: string | string[], createTime: string) {
      const targetProfileIndex = this.saveList.findIndex(item => item.id === id);
      const targetHistoryIndex = this.saveList[targetProfileIndex].historyBackupList.findIndex(item => item.createTime === createTime);
      this.saveList[targetProfileIndex].historyBackupList.splice(targetHistoryIndex, 1);
    },
    changeBackupNote(text: string, id: string | string[], createTime: string) {
      const targetProfileIndex = this.saveList.findIndex(item => item.id === id);
      const targetHistoryIndex = this.saveList[targetProfileIndex].historyBackupList.findIndex(item => item.createTime === createTime);
      this.saveList[targetProfileIndex].historyBackupList[targetHistoryIndex].note = text;
    },
    changeSnackTextThenShow (text: string) {
      this.globalSnackBarText = text;
      this.globalSnackBar = true;
    }
  },
  persist: {
    paths: ['mainConfig', 'saveList']
  }
});