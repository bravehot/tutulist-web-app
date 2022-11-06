<script setup lang="ts">
import { reactive, ref, watch, watchEffect, toRefs } from "vue";
import { Add20Filled as AddIcon } from "@vicons/fluent";

import MenuLabel from "./components/MenuLabel.vue";

import useGlobalStore from "@/stores/global";

import { handleRemoveFolder } from "@/service/calendar/todoBox";

import { SortFolderType, TodoFolder } from "@/types/pages/todoBox";
import { SaveEnum } from "@/types/enum";

const props = defineProps<{
  activeKey: number;
  getList: (menuKey?: number) => void;
  handleMove: (dragIndex: number, hoverIndex: number) => void;
  handleSort: (item: SortFolderType) => void;
}>();

const emits = defineEmits<{
  (e: "update:activeKey", value: number | string): void;
  (
    e: "add",
    folderInfo: { name: string },
    type: SaveEnum,
    folderId?: number
  ): void;
}>();

const globalStore = useGlobalStore();
const { folderList } = toRefs(globalStore);

const menuKey = ref();

const openModel = reactive({
  show: false,
  key: -1,
});
const folderInfo = reactive({
  name: "",
});

watchEffect(() => {
  menuKey.value = props.activeKey;
});

const handleCreate = () => {
  if (folderInfo.name !== "") {
    emits(
      "add",
      folderInfo,
      openModel.key > 0 ? SaveEnum.EDIT : SaveEnum.SAVE,
      openModel.key
    );
  } else {
    window.$message.warning("请输入清单名称");
  }
};

const removeFolder = async (folderId: number) => {
  const { code } = await handleRemoveFolder(folderId);
  if (code === 200) {
    window.$message.success("删除成功");
    props.getList();
  }
};

const setModalShow = (isShow: boolean, menuKey: number, name: string) => {
  openModel.show = isShow;
  openModel.key = menuKey;
  folderInfo.name = name;
};

watch(
  () => openModel.show,
  (isShow) => {
    if (!isShow) {
      setTimeout(() => {
        openModel.key = -1;
        folderInfo.name = "";
      }, 500);
    }
  }
);

const setMenuKey = (key: number) => {
  menuKey.value = key;
  emits("update:activeKey", key);
};
</script>
<template>
  <section
    class="w-52 flex flex-col h-full border-r border-gray-200 dark:border-gray-800"
  >
    <section class="w-full flex pt-2 pb-0 px-4 items-center justify-between">
      <span class="text-xs mr-2"> 清单列表 </span>
      <n-button size="tiny" secondary circle @click="openModel.show = true">
        <n-icon>
          <AddIcon />
        </n-icon>
      </n-button>
    </section>

    <section class="flex-1 px-2">
      <section
        v-for="(folder, index) in folderList"
        :key="folder.id"
        class="h-10 mt-2 leading-10 hover:bg-gray-100 hover:dark:bg-gray-700/50 rounded cursor-pointer"
        @click="setMenuKey(folder.id)"
      >
        <MenuLabel
          :active-key="menuKey"
          :index="index"
          :label="folder.name"
          :menu-key="folder.id"
          :set-modal-show="setModalShow"
          :remove-folder="removeFolder"
          @set-key="setMenuKey"
          @move="handleMove"
          @sort="handleSort"
        />
      </section>
    </section>
  </section>

  <n-modal
    v-model:show="openModel.show"
    preset="dialog"
    :title="`${openModel.key > 0 ? '编辑' : '创建'}清单`"
    :show-icon="false"
    :positive-text="`${openModel.key > 0 ? '保存' : '创建'}`"
    @positive-click="handleCreate"
  >
    <n-form>
      <n-form-item>
        <n-input
          v-model:value="folderInfo.name"
          autofocus
          show-count
          placeholder="请输入清单名称"
          maxlength="20"
        />
      </n-form-item>
    </n-form>
  </n-modal>
</template>
