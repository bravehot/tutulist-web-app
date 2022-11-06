<script setup lang="ts">
import { h, ref } from "vue";
import { NButton, useDialog } from "naive-ui";
import { useDrag, useDrop, XYCoord } from "vue3-dnd";

import {
  MoreHorizontal20Regular as MoreIcon,
  Folder20Regular as FolderIcon,
} from "@vicons/fluent";

import { ItemTypes } from "../utils/constant";
import { SortFolderType } from "@/types/pages/todoBox";

type DragItem = {
  sourceIndex: number;
  moveIndex: number;
  id: number;
};

const props = defineProps<{
  activeKey: number;
  index: number;
  menuKey: number;
  label: string;
  setModalShow: (isShow: boolean, menuKey: number, name: string) => void;
  removeFolder: (folderId: number) => void;
}>();

const emits = defineEmits<{
  (e: "setKey", menuKey: number): void;
  (e: "move", dragIndex: number, hoverIndex: number): void;
  (e: "sort", item: SortFolderType): void;
}>();

const dialog = useDialog();
const [, drop] = useDrop<DragItem>({
  accept: ItemTypes.TODO_BOX,
  hover: (item, monitor) => {
    const dragIndex = item.moveIndex;
    const hoverIndex = props.index;
    if (dragIndex === hoverIndex) {
      return;
    }
    const hoverBoundingRect = todoRef.value?.getBoundingClientRect();
    if (hoverBoundingRect) {
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      emits("move", dragIndex, hoverIndex);
      item.moveIndex = hoverIndex;
    }
  },
});
const [collect, drag] = useDrag({
  type: ItemTypes.TODO_BOX,
  item: () => ({
    id: props.menuKey,
    moveIndex: props.index,
    sourceIndex: props.index + 1,
  }),
  collect: (monitor) => ({
    isDragging: monitor.isDragging(),
  }),
  end: (item) => {
    emits("sort", item);
  },
});

const todoRef = ref<HTMLElement | null>(null);

const handleSelect = (key: string) => {
  const { setModalShow, menuKey, label } = props;
  switch (key) {
    case "edit":
      setModalShow(true, menuKey, label);
      break;
    case "delete":
      dialog.warning({
        title: "警告",
        content: `确定要删除 "${label}" 清单吗？`,
        positiveText: "确定",
        onPositiveClick: () => {
          props.removeFolder(menuKey);
        },
      });
      break;
    default:
      break;
  }
};

const dropDownOptions = [
  {
    label: () =>
      h(
        NButton,
        {
          text: true,
          type: "primary",
          size: "tiny",
        },
        { default: () => "编辑" }
      ),
    key: "edit",
  },
  {
    label: () =>
      h(
        NButton,
        {
          text: true,
          type: "error",
          size: "tiny",
        },
        { default: () => "删除" }
      ),
    key: "delete",
  },
];

const setRef = (el: HTMLDivElement) => {
  todoRef.value = drag(drop(el)) as HTMLDivElement;
};

const handleClick = () => {
  emits("setKey", props.menuKey);
};
</script>
<template>
  <div :ref="(setRef as any)" :style="{ opacity: collect.isDragging ? 0 : 1 }">
    <n-el
      tag="div"
      :class="[
        'h-full flex items-center flex-start px-2 transition rounded-md bg-transparent',
        { 'bg-green-100/50 dark:bg-green-700/30': activeKey === menuKey },
      ]"
      :style="
        activeKey === menuKey
          ? {
              color: 'var(--primary-color)',
            }
          : null
      "
    >
      <n-icon size="20" class="mr-2">
        <FolderIcon />
      </n-icon>
      <n-ellipsis style="max-width: 135px">
        {{ label }}
      </n-ellipsis>

      <n-dropdown
        size="small"
        placement="bottom"
        trigger="hover"
        :options="dropDownOptions"
        @select="handleSelect"
      >
        <n-button size="tiny" text class="!ml-auto">
          <template #icon>
            <n-icon class="text-gray-500 dark:text-gray-300">
              <MoreIcon class="rotate-90" />
            </n-icon>
          </template>
        </n-button>
      </n-dropdown>
    </n-el>
  </div>
</template>
