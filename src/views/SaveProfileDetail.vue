<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">存档配置</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="newProfileConfig.name" label="配置名称" required></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="newProfileConfig.dirName" hint="修改该值后保存会影响到目录名称" persistent-hint
              label="备份文件夹名称"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="newProfileConfig.location" label="存档路径" @click:control="selectBackupFolder" readonly
              required></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" md="2">
            <v-text-field type="number" v-model="newProfileConfig.autoBackupTime" label="自动备份时间间隔" hint="单位为小时"
              persistent-hint required disabled></v-text-field>
          </v-col>
          <v-col cols="12" sm="8" md="6">
            <v-switch :color="themeColor" v-model="newProfileConfig.isOnlyOverwrite"
              :label="`存档还原方式：${newProfileConfig.isOnlyOverwrite ? '仅覆盖' : '清空目录后覆盖'}`"></v-switch>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue-darken-1" variant="text" @click="saveProfile">
        保存
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-card class="mt-4">
    <v-card-title>
      <span class="text-h5">历史备份</span>
    </v-card-title>
    <v-list v-if="saveList[targetProfileIndex].historyBackupList.length !== 0" lines="two">
      <v-list-item v-for="item in saveList[targetProfileIndex].historyBackupList" :key="item.createTime"
        :title="item.createTime" :subtitle="item.note">
        <template v-slot:prepend>
          <v-avatar :color="themeColor">
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
                <v-btn color="primary" variant="text" @click="() => editBackupNote(item.createTime)">
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

    <placeholding-message message="暂无历史备份" icon-size="48" font-size="20px" v-else />
  </v-card>
  <div class="control-area">
    <v-tooltip text="删除存档配置">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" @click="confirmDialog = true" color="red-darken-2" icon="mdi-delete"></v-btn>
      </template>
    </v-tooltip>
    <v-tooltip text="新建历史备份">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" @click="createBackupDialog = true" :color="themeColor"
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
        <v-btn :color="themeColor" variant="text" @click="confirmDialog = false">
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
      <v-card-title class="text-h5">
        历史备份配置
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="backupNote" label="备注"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="themeColor" variant="text" @click="createBackupDialog = false">
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
import { ref, reactive, mergeProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { type SaveItemInter } from '../types/index';
import { usePrimaryConfigStore } from '../stores/primaryConfig';
import PlaceholdingMessage from '@/components/placeholdingMessage.vue';

const route = useRoute();
const router = useRouter();

const { saveList, saveFolder, themeColor } = storeToRefs(usePrimaryConfigStore());
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

const backupNote = ref<string>('');

const noteEditText = ref<string>('');

const targetProfileIndex: number = saveList.value.findIndex(item => item.id === route.params.id);

const initialProfile = (): SaveItemInter => (saveList.value[targetProfileIndex]);

let newProfileConfig = reactive<SaveItemInter>(initialProfile());

async function selectBackupFolder() {
  const filePath = await window.electronAPI.selectFolder();
  if (filePath) {
    newProfileConfig.location = filePath;
  }
}

async function saveProfile() {
  saveList.value[targetProfileIndex].name = newProfileConfig.name;
  saveList.value[targetProfileIndex].location = newProfileConfig.location;

  if (saveList.value[targetProfileIndex].dirName !== newProfileConfig.dirName) {
    const result = await window.electronAPI.renameAction({ basePath: saveFolder.value, oldName: saveList.value[targetProfileIndex].dirName, newName: newProfileConfig.dirName });
    console.log(result);
    saveList.value[targetProfileIndex].dirName = newProfileConfig.dirName;
  }

  saveList.value[targetProfileIndex].autoBackupTime = newProfileConfig.autoBackupTime;
  saveList.value[targetProfileIndex].isOnlyOverwrite = newProfileConfig.isOnlyOverwrite;

  changeSnackTextThenShow('配置已保存');
}

async function createNewBackup() {
  const createTime = dayjs().format('YYYYMMDD HHmmss');

  const result = await window.electronAPI.createBackup({
    createTime,
    basePath: saveFolder.value,
    targetFolderName: newProfileConfig.dirName,
    sourcePath: newProfileConfig.location
  });

  changeSnackTextThenShow(result);

  if (result !== '创建备份成功') return;

  addHistoryBackup(newProfileConfig.id, { createTime, note: backupNote.value });

  backupNote.value = '';
  createBackupDialog.value = false;
}

async function restoreBackup(createTime: string) {
  let msg = await window.electronAPI.restoreBackup({
    createTime,
    basePath: saveFolder.value,
    folderName: newProfileConfig.dirName,
    destination: newProfileConfig.location,
    isOnlyOverwrite: newProfileConfig.isOnlyOverwrite
  });

  changeSnackTextThenShow(msg);
}

function editBackupNote(createTime: string) {
  changeBackupNote(noteEditText.value, newProfileConfig.id, createTime);
  noteEditMenu.value = false;
  noteEditText.value = '';
}

async function deleteBackup(createTime: string) {
  const msg = await window.electronAPI.deleteFolder([saveFolder.value, newProfileConfig.dirName, createTime]);
  changeSnackTextThenShow(msg);
  if (msg === '目录删除成功') {
    deleteHistoryBackup(newProfileConfig.id, createTime);
  }
}

async function deleteProfile() {
  deleteSaveProfile(newProfileConfig.id);
  if (isDeleteFile.value) {
    const msg = await window.electronAPI.deleteFolder([saveFolder.value, newProfileConfig.dirName]);

    changeSnackTextThenShow(msg);

    if (msg !== '目录删除成功') return;
  }
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
</style>