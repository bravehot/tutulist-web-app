<script setup lang="ts">
import { computed, h, ref, watch } from "vue";
import { NButton } from "naive-ui";

import { PriorityEnum } from "@/types/components/popover";

const PRIORITY_OPTIONS = [
  {
    label: () =>
      h(
        NButton,
        {
          text: true,
          type: "error",
        },
        { default: () => "重要且紧急" }
      ),
    key: PriorityEnum.IMPORTANT_URGENT,
  },
  {
    label: () =>
      h(
        NButton,
        {
          text: true,
          type: "warning",
        },
        { default: () => "重要不紧急" }
      ),
    key: PriorityEnum.IMPORTANT_NOTURGENT,
  },
  {
    label: () =>
      h(
        NButton,
        {
          text: true,
          type: "info",
        },
        { default: () => "不重要但紧急" }
      ),
    key: PriorityEnum.UNIMPORTANT_URGENT,
  },
  {
    label: () =>
      h(
        NButton,
        {
          text: true,
          type: "success",
        },
        { default: () => "不重要不紧急" }
      ),
    key: PriorityEnum.UNIMPORTANT_NOTURGENT,
  },
];

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    priority: PriorityEnum;
  }>(),
  {
    disabled: false,
    priority: PriorityEnum.UNIMPORTANT_NOTURGENT,
  }
);

const selectPriority = ref<PriorityEnum>(props.priority);

const emtis = defineEmits<{
  (e: "update:priority", value: PriorityEnum): void;
}>();

const priorityClassName = computed(() => {
  const priority = selectPriority.value;
  let color = "bg-green-400";

  switch (priority) {
    case PriorityEnum.IMPORTANT_URGENT:
      color = "bg-red-400";
      break;
    case PriorityEnum.IMPORTANT_NOTURGENT:
      color = "bg-amber-400";
      break;
    case PriorityEnum.UNIMPORTANT_URGENT:
      color = "bg-sky-400";
      break;
    case PriorityEnum.UNIMPORTANT_NOTURGENT:
      color = "bg-green-400";
      break;
  }
  return color;
});

const handleSelect = (value: PriorityEnum) => {
  selectPriority.value = value;
  emtis("update:priority", value);
};

watch(
  () => props.priority,
  (value) => {
    selectPriority.value = value;
  }
);
</script>
<template>
  <n-dropdown
    placement="bottom"
    trigger="click"
    :options="PRIORITY_OPTIONS"
    :to="false"
    :disabled="disabled"
    @select="handleSelect"
  >
    <section class="h-3 w-3 ml-auto cursor-pointer flex">
      <span
        :class="[
          `animate-ping relative inline-block h-3 w-3 rounded-full opacity-75 ${priorityClassName}`,
        ]"
      ></span>
      <span
        :class="[
          `absolute inline-flex rounded-full h-3 w-3 ${priorityClassName}`,
        ]"
      ></span>
    </section>
  </n-dropdown>
</template>
<style scoped></style>
