<script setup lang="ts">
import { useDrag } from "vue3-dnd";

import { SourceEventType } from "@/types/components/calendar";
import { PriorityEnum } from "@/types/components/popover";
import { DragEventTypeEnum } from "@/types/pages/home";

const props = defineProps<{
  eventInfo: SourceEventType;
}>();

const emits = defineEmits<{
  (e: "move", priority: PriorityEnum, eventInfo: SourceEventType): void;
}>();

const [, drag] = useDrag({
  type: DragEventTypeEnum.EVENT,
  item: () => props.eventInfo,
  end: (_item, monitor) => {
    const isDidProp = monitor.didDrop();
    if (isDidProp) {
      const dropResult: { priority: PriorityEnum } | null =
        monitor.getDropResult();
      if (dropResult) {
        const { priority } = dropResult;
        emits("move", priority, props.eventInfo);
      }
    }
  },
});
</script>
<template>
  <section
    :ref="drag"
    :class="[
      'h-10 px-2 box-border rounded leading-10 border-b border-gray-100 dark:border-gray-700 cursor-pointer dark:hover:bg-gray-500/30 hover:bg-gray-100 transition-all',
      {
        'dark:text-gray-500 text-gray-400': eventInfo.isDone,
      },
    ]"
  >
    {{ eventInfo.title }}
  </section>
</template>
