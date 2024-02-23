<template>
  <form>
    <v-text-field @click:control="selectFolder" :color="primaryConfigStore.themeColor" hint="用于设置存档的保存路径" persistent-hint
      readonly label="保存路径" v-model="primaryConfigStore.saveFolder" required></v-text-field>
  </form>
</template>

<script setup lang="ts">
// import { reactive } from 'vue';
import { useIpcRenderer } from '@vueuse/electron';
import { usePrimaryConfigStore } from '../stores/primaryConfig';

const ipcRenderer = useIpcRenderer();

const primaryConfigStore = usePrimaryConfigStore();

ipcRenderer.on('selectedSaveFolder', (e, files) => {
  console.log(files);
  primaryConfigStore.saveFolder = files[0];
});

function selectFolder() {
  ipcRenderer.send('chose-directory-dialog', { prop: 'openDirectory', action: 'selectedSaveFolder' });
}
</script>

<style scoped></style>