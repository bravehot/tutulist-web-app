<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import {
  ChevronDown20Filled as ArrowIcon,
  ClipboardClock24Regular as EmptyIcon,
  CalendarToday20Regular as CalendarIcon,
} from "@vicons/fluent";

import TodoItem from "./components/TodoItem.vue";
import TodoBoxSelect from "../components/TodoBoxSelect.vue";
import PrioritySelect from "../components/PrioritySelect.vue";

import { handleSortTodoList } from "./utils";
import {
  getTodoListRequest,
  handleMoveTodo,
  handleRemoveTodo,
  handleSaveTodo,
  handleUpdateTodo,
} from "@/service/calendar/todoBox";

import {
  MonthEnum,
  TodoFolder,
  TodoSortList,
  TodoType,
} from "@/types/pages/todoBox";
import TimeSelect from "../home/components/PopoverAdd/TimeSelect.vue";
import { isEqual } from "lodash-es";
import { PriorityEnum } from "@/types/components/popover";

const TODAY = dayjs().format("YYYY-MM-DD");
const POPOVER_SELECT_OPTIONS = [
  {
    label: "近一个月",
    value: MonthEnum.ONE_MONTH,
  },
  {
    label: "近三个月",
    value: MonthEnum.THREE_MONTH,
  },
  {
    label: "近半年",
    value: MonthEnum.HALF_YEAR,
  },
  {
    label: "近一年",
    value: MonthEnum.ONE_YEAR,
  },
  {
    label: "全部",
    value: MonthEnum.MORE,
  },
];

const props = defineProps<{
  folderId: string | number;
  activeInfo: TodoFolder | null;
  folderList: TodoFolder[];
}>();

const emtis = defineEmits<{
  (e: "update:folderId", folderId: number): void;
}>();

const descriptionRef = ref<HTMLTextAreaElement>();

const todoList = ref<Array<{
  name: string;
  list: TodoSortList[];
}> | null>(null);

const addTitle = ref();
const sourceTodoList = ref<TodoType[]>([]);
const assignTime = ref<number | null>(null);
const clickTodoInfo = reactive<{
  startTime: string;
  endTime: string;
  todoInfo: TodoType | null;
}>({
  startTime: "",
  endTime: "",
  todoInfo: null,
});
const selectMonthInfo = reactive({
  monthNum: 1,
  monthText: "近一个月",
});
const eventInfo = reactive({
  title: "",
  description: "",
  priority: PriorityEnum.UNIMPORTANT_NOTURGENT,
});

const inputPlaceholder = computed(() => {
  const activeInfo = props.activeInfo;
  if (activeInfo?.name) {
    return `添加任务至 ${activeInfo?.name} , 回车即可保存`;
  }
  return "请输入任务，回车即可保存";
});

const assignTimeText = computed(() => {
  const diffDays = dayjs(assignTime.value).diff(TODAY, "d");
  const diffYear = dayjs(assignTime.value).diff(TODAY, "year");
  let dayName = "";
  if (Math.abs(diffDays) <= 2) {
    const isLast = diffDays !== 0 && diffDays < 0;
    switch (Math.abs(diffDays)) {
      case 0:
        dayName = "今天";
        break;
      case 1:
        dayName = isLast ? "昨天" : "明天";
        break;
      case 2:
        dayName = isLast ? "前天" : "后天";
        break;
    }
  }

  if (assignTime.value) {
    if (dayName) {
      return dayName;
    }

    if (diffYear === 0) {
      return dayjs(assignTime.value).format("MM月DD日");
    }
    return dayjs(assignTime.value).format("YY年MM月DD日");
  }
  return "";
});

onMounted(() => {
  getTodoListByFolderId(props.folderId, selectMonthInfo.monthNum);
});

watch(
  () => props.folderId,
  (folderId) => {
    selectMonthInfo.monthNum = 1;
    selectMonthInfo.monthText = "近一个月";
    setInitialInfo();
    if (folderId > 0) {
      getTodoListByFolderId(folderId, selectMonthInfo.monthNum);
    } else {
      sourceTodoList.value = [];
      todoList.value = null;
    }
  }
);

const handleKeyUp = () => {
  descriptionRef.value?.focus();
};

const getTodoListByFolderId = async (
  folderId: string | number,
  month: MonthEnum
) => {
  if (folderId > 0) {
    const { code, data } = await getTodoListRequest({
      id: Number(folderId),
      month,
    });
    if (code === 200) {
      sourceTodoList.value = data;
      todoList.value = handleSortTodoList(sourceTodoList.value);
    }
  }
};

const getTodoListByTime = (value: number, option: { label: string }) => {
  getTodoListByFolderId(props.folderId, value);
  selectMonthInfo.monthNum = value;
  selectMonthInfo.monthText = option.label;
};

const handleSave = async () => {
  const title = addTitle.value ?? "(无标题)";
  const { code, data } = await handleSaveTodo({
    folderId: props.folderId.toString(),
    title,
    time: dayjs().format("YYYY-MM-DD"),
  });
  if (code === 200) {
    sourceTodoList.value.push(data);
    todoList.value = handleSortTodoList(sourceTodoList.value);
    window.$message.success("添加成功");
    addTitle.value = "";
  }
};

const handleUpdate = async () => {
  const clickInfo = clickTodoInfo.todoInfo;

  const oldInfo = {
    title: clickInfo?.title,
    description: clickInfo?.description,
  };
  const isSame = isEqual(oldInfo, eventInfo);
  const defaultTitle = "(无标题)";
  if (clickInfo) {
    if (!isSame || assignTime.value) {
      const { code } = await handleUpdateTodo({
        ...clickInfo,
        title: eventInfo.title || defaultTitle,
        description: eventInfo.description,
        priority: eventInfo.priority,
        assignTime: assignTime.value
          ? dayjs(assignTime.value).format("YYYY-MM-DD")
          : "",
      });
      if (code === 200) {
        window.$message.success("更新成功");
        if (!eventInfo.title) {
          eventInfo.title = defaultTitle;
        }
        if (assignTime.value) {
          setInitialInfo();
        }
        reloadTodoList();
      }
    }
  } else {
    window.$message.success("更新成功");
  }
};

const handleClickTodo = (todoInfo: TodoType) => {
  clickTodoInfo.startTime = todoInfo.time;
  clickTodoInfo.endTime = todoInfo.time;
  clickTodoInfo.todoInfo = todoInfo;
  eventInfo.title = todoInfo.title;
  eventInfo.description = todoInfo.description;
  eventInfo.priority = todoInfo.priority;
};

const handleSelectFolder = async (folderId: number) => {
  if (clickTodoInfo.todoInfo) {
    const { code } = await handleMoveTodo({
      folderId,
      todoId: clickTodoInfo.todoInfo.id,
    });
    if (code === 200) {
      window.$message.success("移动成功");
      emtis("update:folderId", folderId);
    }
  }
};

const handleRemove = async () => {
  if (clickTodoInfo.todoInfo) {
    const { code } = await handleRemoveTodo(clickTodoInfo.todoInfo.id);
    if (code === 200) {
      window.$message.success("删除成功");
      setInitialInfo();
      reloadTodoList();
    }
  }
};

const reloadTodoList = async () => {
  await getTodoListByFolderId(props.folderId, selectMonthInfo.monthNum);
};

const handleReloadList = (title: string) => {
  eventInfo.title = title;
  reloadTodoList();
};

const handleAssignTime = (time: number) => {
  assignTime.value = time;
};

const setInitialInfo = () => {
  eventInfo.description = "";
  eventInfo.title = "";
  eventInfo.priority = PriorityEnum.UNIMPORTANT_NOTURGENT;
  clickTodoInfo.startTime = "";
  clickTodoInfo.endTime = "";
  clickTodoInfo.todoInfo = null;
  assignTime.value = null;
};
</script>
<template>
  <section class="flex-1 flex">
    <section
      class="w-1/2 h-full pt-1 px-5 border-r flex flex-col border-gray-200 dark:border-gray-800"
    >
      <n-input
        v-model:value="addTitle"
        autofocus
        maxlength="20"
        :placeholder="inputPlaceholder"
        show-count
        clearable
        @keydown.enter="handleSave"
      />
      <section class="flex-1">
        <template v-if="todoList">
          <section class="flex mt-2 justify-end">
            <n-popselect
              v-model:value="selectMonthInfo.monthNum"
              :options="POPOVER_SELECT_OPTIONS"
              trigger="click"
              :on-update:value="getTodoListByTime"
            >
              <n-button
                text
                size="tiny"
                class="flex flex-row-reverse"
                type="tertiary"
              >
                <template #icon>
                  <n-icon class="ml-2"><ArrowIcon /></n-icon>
                </template>
                {{ selectMonthInfo.monthText }}
              </n-button>
            </n-popselect>
          </section>

          <n-collapse :default-expanded-names="[0]">
            <template v-for="(todoInfo, index) in todoList">
              <n-collapse-item
                v-if="todoInfo.list.length"
                :key="todoInfo.name"
                :title="todoInfo.name"
                :name="index"
              >
                <!-- 默认打开第一个折叠面板 -->
                <n-collapse v-if="todoInfo.list" :default-expanded-names="[0]">
                  <n-collapse-item
                    v-for="(todoItem, _index) in todoInfo.list"
                    :key="todoItem.time"
                    :title="todoItem.time"
                    :name="_index"
                  >
                    <TodoItem
                      v-for="todo in todoItem.list"
                      :key="todo.id + todo.title"
                      :active-id="clickTodoInfo.todoInfo?.id"
                      :todo-info="todo"
                      @click="handleClickTodo(todo)"
                      @reload-list="handleReloadList"
                    />
                  </n-collapse-item>
                </n-collapse>
              </n-collapse-item>
            </template>
          </n-collapse>
        </template>

        <section v-else class="h-full flex items-center justify-center">
          <n-empty :show-description="false" size="huge">
            <template #extra>
              <n-el
                tag="div"
                style="
                  transition: color 0.3s var(--n-bezier);
                  color: var(--n-text-color);
                "
              >
                <span class="text-sm">
                  致那些想做<br />却又不知何时去做的事情
                </span>
              </n-el>
            </template>
          </n-empty>
        </section>
      </section>
    </section>

    <section class="w-1/2 h-full px-2">
      <template v-if="todoList?.length && clickTodoInfo.startTime">
        <section class="flex flex-col justify-start h-full">
          <section
            class="border-b border-gray-200 dark:border-gray-800 h-10 flex items-center justify-between"
          >
            <TimeSelect
              disabled
              :start-time="clickTodoInfo.startTime"
              :end-time="clickTodoInfo.endTime"
            />
            <PrioritySelect v-model:priority="eventInfo.priority" disabled />
          </section>

          <section class="px-2 flex flex-col content">
            <input
              v-model="eventInfo.title"
              type="text"
              class="w-full mt-2 font-mono h-8 mb-2 focus:outline-none text-base caret-gray-600 dark:caret-gray-300 text-gray-600 dark:text-zinc-400 tracking-wider font-normal leading-6 bg-transparent"
              placeholder="准备做点什么"
              maxlength="30"
              @keyup.enter="handleKeyUp"
            />
            <textarea
              ref="descriptionRef"
              v-model="eventInfo.description"
              placeholder="描述"
              class="focus:outline-none w-full flex-1 resize-none text-sm m-0 caret-gray-500 dark:caret-gray-200 text-gray-500 dark:text-zinc-400 tracking-wider font-normal leading-6 bg-transparent overflow-x-hidden"
              maxlength="100"
            />
          </section>

          <section
            class="w-full flex items-center justify-start mt-auto bottom-0 h-12 border-t border-gray-200 dark:border-gray-800"
          >
            <n-popover
              ref="popoverRef"
              trigger="click"
              placement="bottom-start"
              :style="{
                padding: '0 5px 0',
              }"
            >
              <template #trigger>
                <n-button size="tiny" class="!mr-3" secondary>
                  <template #icon>
                    <n-icon size="18">
                      <CalendarIcon />
                    </n-icon>
                  </template>
                  <span class="text-xs inline-block scale-90">
                    分配至 {{ assignTimeText }}</span
                  >
                </n-button>
              </template>
              <n-date-picker
                size="tiny"
                :actions="[]"
                :value="assignTime"
                panel
                type="date"
                :on-update:value="handleAssignTime"
              />
            </n-popover>
            <TodoBoxSelect
              :folder-id="(folderId as number)"
              @move="handleSelectFolder"
              @remove="handleRemove"
            />
            <n-button
              size="small"
              type="primary"
              class="!ml-auto"
              @click="handleUpdate"
            >
              保存
            </n-button>
          </section>
        </section>
      </template>
      <section v-else class="w-full h-full flex items-center justify-center">
        <n-empty :show-description="false" size="huge">
          <template #icon>
            <n-icon>
              <EmptyIcon />
            </n-icon>
          </template>
          <template #extra>
            <n-el
              tag="div"
              style="
                transition: color 0.3s var(--n-bezier);
                color: var(--n-text-color);
              "
            >
              <span class="text-sm"> 点击标题,查看任务详情 </span>
            </n-el>
          </template>
        </n-empty>
      </section>
    </section>
  </section>
</template>

<style lang="scss" scoped>
.content {
  height: calc(100% - 40px);
}
</style>
