<script setup lang="ts">
import { getEmptyImage } from "react-dnd-html5-backend";
import { inject, onMounted } from "vue";
import { useDrag } from "vue3-dnd";

import { DragEventTypeEnum } from "@/types/components/calendar";
import {
  CalendarKey,
  CalendarInfoType,
  DropResult,
} from "@/types/components/calendar";

const props = defineProps<{
  dateInfo: CalendarInfoType;
}>();

const injectInfo = inject(CalendarKey);

const [, drag, preview] = useDrag({
  type: DragEventTypeEnum.NEW,
  item: () => ({
    dragTime: props.dateInfo.fullTime,
    dateIndex: props.dateInfo.dateIndex,
  }),
  end: (item, monitor) => {
    const isDidProp = monitor.didDrop();
    if (isDidProp) {
      const dropResult: DropResult | null = monitor.getDropResult();
      if (dropResult) {
        const dragItem = {
          dateIndex: item.dateIndex,
          time: item.dragTime,
        };
        const dropItem = {
          dateIndex: dropResult.dateIndex,
          time: dropResult.dropTime,
        };

        if (dragItem.dateIndex > dropItem.dateIndex) {
          injectInfo?.createNewEvent(dropItem, dragItem);
        } else {
          injectInfo?.createNewEvent(dragItem, dropItem);
        }
      }
    }
  },
});

onMounted(() => {
  const emptyImage = getEmptyImage();
  preview(emptyImage, { captureDraggingState: true });
});
</script>
<template>
  <section :ref="drag" class="new"></section>
</template>

<style scoped lang="scss">
.new {
  height: calc(100% - 28px);
}
</style>
