<script setup lang="ts">
import { inject, onMounted } from "vue";
import { useDrag } from "vue3-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import { DragEventTypeEnum } from "@/types/components/calendar";
import {
  EventType,
  CalendarInfoType,
  CalendarKey,
} from "@/types/components/calendar";

const injectInfo = inject(CalendarKey);

const props = defineProps<{
  eventInfo: EventType | null;
  dateInfo: CalendarInfoType;
}>();

const [, drag, preview] = useDrag({
  type: DragEventTypeEnum.FORWARD,
  item: () => ({
    dragTime: props.dateInfo.fullTime,
    eventId: props.eventInfo?.id,
    eventTitle: props.eventInfo?.title,
  }),
  end: (_item, monitor) => {
    const isDidProp = monitor.didDrop();
    if (isDidProp && props.eventInfo) {
      const dropResult: { dropTime: string } | null = monitor.getDropResult();
      if (dropResult && dropResult.dropTime !== props.dateInfo.fullTime) {
        const { id } = props.eventInfo;
        injectInfo?.handleForwardDrag(id, dropResult.dropTime);
      }
    }
  },
});

onMounted(() => {
  const emptyImage = getEmptyImage();
  preview(emptyImage, { captureDraggingState: true });
});

const handleClick = (event: MouseEvent) => {
  event.stopPropagation();
};
</script>
<template>
  <section :ref="drag" class="forward" @click="handleClick"></section>
</template>
<style scoped lang="scss">
.forward {
  @apply w-2 h-full translate-x-1/2 bg-transparent cursor-w-resize;
}
</style>
