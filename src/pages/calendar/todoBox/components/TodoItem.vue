<script setup lang="ts">
import { computed, ref } from "vue";
import { handleUpdateTodo } from "@/service/calendar/todoBox";

import { TodoType } from "@/types/pages/todoBox";

const props = defineProps<{ todoInfo: TodoType; activeId?: number }>();

const emits = defineEmits<{
  (e: "reload-list", title: string): void;
}>();
const inputValue = ref(props.todoInfo.title);

const handleUpdate = async () => {
  const { title } = props.todoInfo;
  if (inputValue.value === "") {
    inputValue.value = "(无标题)";
  }
  if (inputValue.value !== title) {
    const { code } = await handleUpdateTodo({
      ...props.todoInfo,
      title: inputValue.value,
    });
    if (code === 200) {
      window.$message.success("修改成功");
      emits("reload-list", inputValue.value);
    }
  }
};

const active = computed(() => {
  const { activeId, todoInfo } = props;
  if (activeId !== undefined) {
    return activeId === todoInfo.id;
  }
  return false;
});
</script>
<template>
  <section
    :class="[
      'w-full flex border-t border-gray-100 dark:border-gray-700 transition rounded-md',
      {
        'bg-gray-100/80 dark:bg-gray-700/30': active,
      },
      {
        'dark:hover:bg-gray-800/80 hover:bg-gray-100/20': !active,
      },
    ]"
  >
    <input
      v-model="inputValue"
      class="flex-1 pl-4 p-2 w-full cursor-pointer border-transparent focus:border-transparent focus:ring-0 focus:outline-none bg-transparent transition"
      @blur="handleUpdate"
    />
  </section>
</template>
