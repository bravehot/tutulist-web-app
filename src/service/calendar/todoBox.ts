import request from "@/utils/request";
import {
  MonthEnum,
  SortFolderType,
  TodoFolder,
  TodoType,
} from "@/types/pages/todoBox";

export const getFolderListRequest = async () => {
  return await request<TodoFolder[]>({
    url: "/todoBox/folderList",
    method: "get",
  });
};

export const createFolderRequest = async (folderInfo: { name: string }) => {
  return await request<TodoFolder[]>({
    url: "/todoBox/createFolder",
    method: "post",
    data: folderInfo,
  });
};

export const handleUpdateFolder = async (folderInfo: {
  id: number;
  name: string;
}) => {
  return await request({
    url: "/todoBox/updateFolder",
    method: "put",
    data: folderInfo,
  });
};

export const handleSortFolder = async (sortInfo: SortFolderType) => {
  return await request({
    url: "/todoBox/sortFolder",
    method: "put",
    data: sortInfo,
  });
};

export const handleRemoveFolder = async (id: number) => {
  return await request({
    url: "/todoBox/removeFolder",
    method: "delete",
    params: { id },
  });
};

export const getTodoListRequest = async (queryInfo: {
  id: number | string;
  month: MonthEnum;
}) => {
  return await request<TodoType[]>({
    url: "/todoBox/todoList",
    method: "get",
    params: queryInfo,
  });
};

export const handleUpdateTodo = async (
  todoInfo: TodoType & { assignTime?: string }
) => {
  return await request({
    url: "/todoBox/updateTodo",
    method: "put",
    data: todoInfo,
  });
};

export const handleSaveTodo = async (info: {
  folderId: string;
  title: string;
  time: string;
}) => {
  return await request<TodoType>({
    url: "/todoBox/addTodo",
    method: "post",
    data: info,
  });
};

export const handleRemoveTodo = async (id: number) => {
  return await request({
    url: "/todoBox/removeTodo",
    method: "delete",
    params: { id },
  });
};

export const handleMoveTodo = async (moveInfo: {
  folderId: number;
  todoId: number;
}) => {
  return await request({
    url: "/todoBox/moveTodo",
    method: "post",
    data: moveInfo,
  });
};
