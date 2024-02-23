import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { type SaveListInter, type SaveItemInter, type HistoryBackupInter } from '../types/index';

export const usePrimaryConfigStore = defineStore('primaryConfig', {
  state: () => ({
    themeColor: 'primary',
    saveFolder: '',
    saveList: [] as SaveListInter,
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
    deleteHistoryBackup(id: string | string[], dateTime: string) {
      const targetProfileIndex = this.saveList.findIndex(item => item.id === id);
      const targetHistoryIndex = this.saveList[targetProfileIndex].historyBackupList.findIndex(item => item.createTime === dateTime);
      this.saveList[targetProfileIndex].historyBackupList.splice(targetHistoryIndex, 1);
    }
  },
  persist: true
});