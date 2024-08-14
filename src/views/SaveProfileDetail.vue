<template>
  <v-card title="存档配置">
    <template v-slot:prepend>
      <v-icon :color="mainConfig.themeColor" icon="mdi-content-save-edit"></v-icon>
    </template>
    <v-form validate-on="blur" @submit.prevent>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="newProfileConfig.name" label="配置名称"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="newProfileConfig.dirName" hint="修改该值后保存会影响到目录名称" persistent-hint
                label="备份文件夹名称"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="newProfileConfig.location" label="存档路径" @click:control="selectBackupFolder"
                readonly></v-text-field>
            </v-col>
            <v-col cols="12" sm="8" md="6">
              <v-switch :color="mainConfig.themeColor" v-model="newProfileConfig.isOnlyOverwrite"
                :label="`存档还原方式：${newProfileConfig.isOnlyOverwrite ? '仅覆盖' : '清空目录后覆盖'}`"></v-switch>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <Transition name="slide-fade">
          <span v-if="!isProfileSave" class="ml-4 text-orange-darken-1">配置有改动，但尚未保存。</span>
        </Transition>
        <v-spacer></v-spacer>
        <v-btn type="submit" :color="mainConfig.themeColor" variant="tonal" @click="saveProfile">
          保存
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
  <v-card class="mt-4">
    <v-card-title>
      <span class="text-h5">历史备份</span>
    </v-card-title>
    <v-list v-if="saveList[targetProfileIndex].historyBackupList.length !== 0" lines="two">
      <v-list-item v-for="item in saveList[targetProfileIndex].historyBackupList" :key="item.createTime"
        :title="returnFormatDate(item.createTime)" :subtitle="item.note">
        <template v-slot:prepend>
          <v-avatar :color="mainConfig.themeColor">
            <v-icon color="white">mdi-history</v-icon>
          </v-avatar>
        </template>

        <template v-slot:append>
          <v-tooltip text="删除历史备份">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" @click="() => deleteBackup(item.createTime)" color="red-accent-4"
                icon="mdi-delete-forever" variant="text"></v-btn>
            </template>
          </v-tooltip>
          <v-menu v-model="noteEditMenu" :close-on-content-click="false">
            <template v-slot:activator="{ props: noteEditMenu }">
              <v-tooltip text="修改备注">
                <template v-slot:activator="{ props: tooltip }">
                  <v-btn v-bind="mergeProps(noteEditMenu, tooltip)" @click="noteEditMenu.value = true" color="blue"
                    icon="mdi-text-box-edit-outline" variant="text"></v-btn>
                </template>
              </v-tooltip>
            </template>

            <v-card min-width="300">
              <v-card-title class="text-h5">
                修改备注
              </v-card-title>

              <v-divider></v-divider>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field v-model="noteEditText" label="备注"></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn variant="text" @click="noteEditMenu = false">
                  取消
                </v-btn>
                <v-btn :color="mainConfig.themeColor" variant="tonal" @click="() => editBackupNote(item.createTime)">
                  保存
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
          <v-tooltip text="还原备份">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" @click="() => restoreBackup(item.createTime)" color="blue" icon="mdi-backup-restore"
                variant="text"></v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-list-item>
    </v-list>

    <v-empty-state v-else icon="mdi-alert-circle" title="暂无历史备份"></v-empty-state>
  </v-card>
  <div class="control-area">
    <!-- <v-tooltip text="删除存档配置">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" @click="confirmDialog = true" color="red-darken-2" icon="mdi-delete"></v-btn>
      </template>
    </v-tooltip> -->
    <v-tooltip text="新建历史备份">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" @click="createBackupDialog = true" :color="mainConfig.themeColor"
          icon="mdi-content-save-plus"></v-btn>
      </template>
    </v-tooltip>
  </div>

  <v-dialog v-model="confirmDialog" persistent width="auto">
    <v-card>
      <v-card-title>
        确认删除存档配置？
      </v-card-title>
      <v-card-text>
        <v-checkbox v-model="isDeleteFile" label="是否删除本地文件"></v-checkbox>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="mainConfig.themeColor" variant="text" @click="confirmDialog = false">
          否
        </v-btn>
        <v-btn color="red-darken-2" variant="text" @click="deleteProfile">
          是
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="createBackupDialog" persistent width="512">
    <v-card>
      <v-card-title class="text-h6">
        历史备份配置
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="backupNote" label="备注" reqiuired></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="mainConfig.themeColor" variant="text" @click="createBackupDialog = false">
          否
        </v-btn>
        <v-btn color="red-darken-2" variant="text" @click="createNewBackup">
          是
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, mergeProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { type SaveItemInter } from '../types/index';
import { usePrimaryConfigStore } from '../stores/primaryConfig';
import { parseCustomDate } from '@/utils/tools';

const route = useRoute();
const router = useRouter();

const { saveList, mainConfig } = storeToRefs(usePrimaryConfigStore());
const {
  changeBackupNote,
  changeSnackTextThenShow,
  addHistoryBackup,
  deleteHistoryBackup,
  deleteSaveProfile
} = usePrimaryConfigStore();

const confirmDialog = ref<boolean>(false);

const createBackupDialog = ref<boolean>(false);

const isDeleteFile = ref<boolean>(false);

const noteEditMenu = ref<boolean>(false);

const isProfileSave = ref<boolean>(true);

const backupNote = ref<string>('');

const noteEditText = ref<string>('');

const targetProfileIndex: number = saveList.value.findIndex(item => item.id === route.params.id);

const initialProfile = (): SaveItemInter => (cloneDeep(saveList.value[targetProfileIndex]));

let newProfileConfig = reactive<SaveItemInter>(initialProfile());

watch(newProfileConfig, (oldValue, newValue) => {
  isProfileSave.value = isEqual(saveList.value[targetProfileIndex], newValue);
}, { deep: true });

async function selectBackupFolder() {
  const res = await window.electronAPI.selectFolder();

  if (res.success) {
    newProfileConfig.location = res.data as string;
  }

  changeSnackTextThenShow(res.message);
}

async function saveProfile() {
  saveList.value[targetProfileIndex].name = newProfileConfig.name;
  saveList.value[targetProfileIndex].location = newProfileConfig.location;

  // console.log(saveList.value[targetProfileIndex].dirName, newProfileConfig.dirName);
  if (saveList.value[targetProfileIndex].dirName !== newProfileConfig.dirName) {
    const res = await window.electronAPI.renameAction({ basePath: mainConfig.value.saveFolder, oldName: saveList.value[targetProfileIndex].dirName, newName: newProfileConfig.dirName });

    if (res.success) {
      saveList.value[targetProfileIndex].dirName = newProfileConfig.dirName;
    }

    changeSnackTextThenShow(res.message);
  }

  saveList.value[targetProfileIndex].isOnlyOverwrite = newProfileConfig.isOnlyOverwrite;

  isProfileSave.value = true;

  changeSnackTextThenShow('配置已保存');
}

async function createNewBackup() {
  if (newProfileConfig.location.length === 0) {
    changeSnackTextThenShow('请先指定存档路径');
    return;
  }

  const createTime = dayjs().format('YYYYMMDD HHmmss');

  const res = await window.electronAPI.createBackup({
    createTime,
    basePath: mainConfig.value.saveFolder,
    targetFolderName: newProfileConfig.dirName,
    sourcePath: newProfileConfig.location
  });

  if (res.success) {
    addHistoryBackup(newProfileConfig.id, { createTime, note: backupNote.value });

    backupNote.value = '';
    createBackupDialog.value = false;
  }

  changeSnackTextThenShow(res.message);

}

async function restoreBackup(createTime: string) {
  let res = await window.electronAPI.restoreBackup({
    createTime,
    basePath: mainConfig.value.saveFolder,
    folderName: newProfileConfig.dirName,
    destination: newProfileConfig.location,
    isOnlyOverwrite: newProfileConfig.isOnlyOverwrite
  });

  changeSnackTextThenShow(res.message);
}

function editBackupNote(createTime: string) {
  changeBackupNote(noteEditText.value, newProfileConfig.id, createTime);
  noteEditMenu.value = false;
  noteEditText.value = '';
}

function returnFormatDate(dateStr: string) {
  return dayjs(parseCustomDate(dateStr)).format('YYYY年MM月DD日 HH:mm:ss');
}

async function deleteBackup(createTime: string) {
  const res = await window.electronAPI.deleteFolder([mainConfig.value.saveFolder, newProfileConfig.dirName, createTime]);
  if (res.success) {
    deleteHistoryBackup(newProfileConfig.id, createTime);
  }

  changeSnackTextThenShow(res.message);
}

async function deleteProfile() {
  if (isDeleteFile.value) {
    const res = await window.electronAPI.deleteFolder([mainConfig.value.saveFolder, newProfileConfig.dirName]);

    changeSnackTextThenShow(res.message);

    if (!res.success) return;
  }

  deleteSaveProfile(newProfileConfig.id);

  confirmDialog.value = false;
  router.replace({ name: 'home' });
}
</script>

<style scoped>
.control-area {
  position: absolute;
  right: 32px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
}

.control-area button {
  margin: 10px 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  /* transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1); */
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>