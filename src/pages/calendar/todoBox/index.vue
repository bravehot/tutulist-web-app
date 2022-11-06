<script setup lang="ts">
import { computed, onMounted, ref, toRaw, watch } from "vue";
import { DndProvider } from "vue3-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useGlobalStore from "@/stores/global";

import ChangeTheme from "../components/ChangeTheme.vue";
import FolderList from "./FolderList.vue";
import TodoList from "./TodoList.vue";

import {
  createFolderRequest,
  getFolderListRequest,
  handleSortFolder,
  handleUpdateFolder,
} from "@/service/calendar/todoBox";

import { SortFolderType, TodoFolder } from "@/types/pages/todoBox";
import { SaveEnum } from "@/types/enum";

const globalStore = useGlobalStore();

const activeKey = ref(-1);
const folderList = ref<TodoFolder[]>([]);

const activeInfo = computed(() => {
  if (activeKey.value) {
    const find = folderList.value.find(
      (folder) => Number(folder.id) === Number(activeKey.value)
    );
    return find ?? null;
  }
  return null;
});

onMounted(() => {
  folderList.value = globalStore.folderList;
  if (folderList.value.length) {
    activeKey.value = folderList.value[0].id;
  }
});

const getFolderList = async (menuKey?: number) => {
  const { code, data } = await getFolderListRequest();
  if (code === 200) {
    folderList.value = handleSortFolderList(data);
    globalStore.setFolderList(folderList.value);
    if (folderList.value.length) {
      activeKey.value = menuKey ?? folderList.value[0].id;
    } else {
      activeKey.value = -1;
    }
  }
};

const handleSortFolderList = (list: TodoFolder[]): TodoFolder[] => {
  if (Array.isArray(list) && list.length) {
    return list.sort((a, b) => a.sortIndex - b.sortIndex);
  }
  return [];
};

const handleAddFolder = async (
  folderInfo: { name: string },
  type: SaveEnum,
  folderId?: number
) => {
  const nameInfo = toRaw(folderInfo.name);
  if (type === SaveEnum.SAVE) {
    const { code, data } = await createFolderRequest(folderInfo);
    if (code === 200) {
      window.$message.success("创建成功");
      folderList.value = handleSortFolderList(data);
    }
  }

  if (type === SaveEnum.EDIT && folderId) {
    const { code } = await handleUpdateFolder({
      name: folderInfo.name,
      id: folderId,
    });
    if (code === 200) {
      window.$message.success("更新成功");
      const find = folderList.value.find((item) => item.id === folderId);
      if (find) {
        find.name = nameInfo;
      }
    }
  }
  globalStore.setFolderList(folderList.value);
};

const handleMoveFolder = (dragIndex: number, hoverIndex: number) => {
  const dragItem = folderList.value[dragIndex];

  folderList.value.splice(dragIndex, 1);
  folderList.value.splice(hoverIndex, 0, dragItem);
};

const saveSortFolderInfo = async (folderInfo: SortFolderType) => {
  const { moveIndex: index, sourceIndex, id } = folderInfo;
  const moveIndex = index + 1;

  if (sourceIndex === moveIndex) {
    return;
  }
  const { code } = await handleSortFolder({
    sourceIndex,
    moveIndex,
    id,
  });
  if (code === 200) {
    window.$message.success("排序成功");
    globalStore.setFolderList(folderList.value);
  }
};
</script>

<template>
  <n-layout>
    <n-layout-header bordered>
      <section class="h-14 flex justify-end px-2">
        <ChangeTheme />
      </section>
    </n-layout-header>
    <n-layout-content class="h-full">
      <section class="w-full px-10 pt-5 pb-0 container">
        <header class="h-10">
          <h2
            class="text-xl text-neutral-700 dark:text-neutral-300 tracking-wider mb-4"
          >
            任务箱
          </h2>
        </header>
        <n-card
          :bordered="false"
          style="height: calc(100% - 48px)"
          :content-style="{
            padding: 0,
          }"
        >
          <section class="flex h-full">
            <DndProvider :backend="HTML5Backend">
              <FolderList
                v-model:activeKey="activeKey"
                :get-list="getFolderList"
                :handle-move="handleMoveFolder"
                :handle-sort="saveSortFolderInfo"
                @add="handleAddFolder"
              />
            </DndProvider>

            <TodoList
              v-model:folderId="activeKey"
              :active-info="activeInfo"
              :folder-list="folderList"
            />
          </section>
        </n-card>
      </section>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped>
.container {
  max-width: none;
  height: calc(100vh - 57px);
  .content {
    height: calc(100% - 100px);
  }
}
</style>
