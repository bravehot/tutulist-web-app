<script setup lang="ts">
import { computed, h, ref, toRefs, VNodeChild } from "vue";
import { MenuOption, NButton, NIcon, SelectOption } from "naive-ui";

import {
  Delete20Regular as DeleteIcon,
  SendClock20Regular as TodoBoxIcon,
  Folder20Regular as FolderIcon,
} from "@vicons/fluent";
import useGlobalStore from "@/stores/global";

const props = defineProps<{
  folderId?: number;
}>();

const emits = defineEmits<{
  (e: "move", folderId: number): void;
  (e: "remove"): void;
}>();

const globalStore = useGlobalStore();

const selectValue = ref(props.folderId);
const { folderList } = toRefs(globalStore);

const selectOptions = computed<MenuOption[]>(() => {
  return folderList.value.map((folderItem) => ({
    label: folderItem.name,
    value: folderItem.id,
  }));
});

const handleMoveTodoBox = (folderId: number) => {
  selectValue.value = folderId;
  emits("move", folderId);
};

const activeFolderInfo = computed(() => {
  const active = folderList.value.find(
    (folder) => folder.id === selectValue.value
  );
  if (active) {
    return active.name;
  }
  return "收集箱";
});

const renderLabel = (option: SelectOption): VNodeChild => {
  return [
    h(
      NIcon,
      {
        size: 16,
        style: {
          verticalAlign: "-0.24em",
          marginRight: "4px",
        },
      },
      {
        default: () => h(FolderIcon),
      }
    ),
    h("span", { className: "text-xs" }, option.label as string),
  ];
};

const handleRemove = () => {
  emits("remove");
};
</script>
<template>
  <n-popselect
    v-model:value="selectValue"
    size="small"
    :options="selectOptions"
    :on-update:value="handleMoveTodoBox"
    :render-label="renderLabel"
    trigger="click"
    :to="false"
  >
    <n-button size="tiny" secondary class="!mr-3" type="tertiary">
      <template #icon>
        <n-icon size="18">
          <TodoBoxIcon />
        </n-icon>
      </template>
      <span class="text-xs inline-block scale-90">
        {{ activeFolderInfo }}
      </span>
    </n-button>
  </n-popselect>

  <n-button size="tiny" secondary type="error">
    <template #icon>
      <n-icon size="18" @click="handleRemove">
        <DeleteIcon />
      </n-icon>
    </template>
  </n-button>
</template>
