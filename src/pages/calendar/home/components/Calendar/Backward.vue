<script setup lang="ts">
import { inject, onMounted } from "vue";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useDrag } from "vue3-dnd";

import {
  CalendarInfoType,
  EventType,
  CalendarKey,
} from "@/types/components/calendar";
import { DragEventTypeEnum } from "@/types/components/calendar";

const props = defineProps<{
  eventInfo: EventType | null;
  dateInfo: CalendarInfoType;
}>();

const injectInfo = inject(CalendarKey);

const [, drag, preview] = useDrag({
  type: DragEventTypeEnum.BACKWARD,
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
        injectInfo?.handleBackwardDrag(id, dropResult?.dropTime);
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
  <section :ref="drag" class="backward" @click="handleClick"></section>
</template>
<style scoped lang="scss">
.backward {
  @apply w-2 h-full -translate-x-1/2 bg-transparent cursor-e-resize;
}
</style>
