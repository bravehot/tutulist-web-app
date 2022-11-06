<script setup lang="ts">
import { computed } from "vue";
import { useDragLayer } from "vue3-dnd";

import { DragEventTypeEnum } from "@/types/components/calendar";
import type { StyleValue } from "vue";
import type { DragItemTypes } from "@/types/components/calendar";

const props = defineProps<{
  dragWidth: number;
}>();

const collect = useDragLayer((monitor) => ({
  item: monitor.getItem<DragItemTypes>(),
  itemType: monitor.getItemType(),
  isDragging: monitor.isDragging(),
  // 拖动源的根DOM节点相对于客户端的初始位置{x, y}
  initialOffset: monitor.getInitialSourceClientOffset(),
  // 拖动源的根DOM节点相对于客户端的初始位置{x, y}
  currentOffset: monitor.getSourceClientOffset(),
}));

const positionInfo = computed<StyleValue>(() => {
  const { initialOffset, currentOffset } = collect.value;
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }
  const { x, y } = currentOffset;

  return {
    top: `${Math.round(y)}px`,
    left: `${Math.round(x)}px`,
    width: `${props.dragWidth ?? 0}px`,
  };
});
</script>

<template>
  <div
    v-if="collect.itemType === DragEventTypeEnum.EVENT"
    class="content"
    :style="positionInfo"
  >
    <template v-if="collect.isDragging">
      {{ collect.item.eventTitle }}
    </template>
  </div>
</template>

<style lang="scss" scoped>
.content {
  @apply fixed w-20 z-50 h-5 flex-1  inline-block leading-5 mb-2 text-green-800 bg-green-400 dark:bg-green-700 dark:text-gray-200 pointer-events-none rounded pl-2 cursor-all-scroll;
}
</style>
