<template>
  <v-card title="基本配置">
    <template v-slot:prepend>
      <v-icon :color="mainConfig.themeColor" icon="mdi-content-save-edit"></v-icon>
    </template>
    <form>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field @click:control="selectFolder" :color="mainConfig.themeColor" hint="用于设置存档的保存路径"
                persistent-hint readonly label="保存路径" v-model="baseConfig.saveFolder"></v-text-field>
            </v-col>
            <!-- <v-col sm="6" md="4">
              <v-select v-model="baseConfig.autoBackupValue" label="自动备份" :items="autoBackupSelect" hint="注意：此处的时间实际上计算的是两次软件启动时的时间差"></v-select>
            </v-col> -->
          </v-row>
        </v-container>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="mainConfig.themeColor" variant="tonal" @click="saveConfig">
          保存
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { usePrimaryConfigStore } from '../stores/primaryConfig';

const { mainConfig } = storeToRefs(usePrimaryConfigStore());
const { changeSnackTextThenShow } = usePrimaryConfigStore();

const baseConfig = reactive({
  autoBackupValue: mainConfig.value.autoBackupTime,
  saveFolder: mainConfig.value.saveFolder
});

// const autoBackupSelect = [
//   {
//     title: '关闭',
//     value: 0
//   },
//   {
//     title: '6小时',
//     value: 6
//   },
//   {
//     title: '12小时',
//     value: 12
//   },
//   {
//     title: '1天',
//     value: 24
//   },
//   {
//     title: '一周',
//     value: 168
//   }
// ];

async function selectFolder() {
  const res = await window.electronAPI.selectFolder();
  if (res.data) {
    baseConfig.saveFolder = res.data as string;
  }
}

function saveConfig () {
  mainConfig.value.saveFolder = baseConfig.saveFolder;
  mainConfig.value.autoBackupTime = baseConfig.autoBackupValue;
  changeSnackTextThenShow('配置已保存');
}
</script>

<style scoped></style>