import { SourceEventType } from "@/types/components/calendar";
import request from "@/utils/request";

export const getEventList = async (queryInfo: {
  startTime: string;
  endTime: string;
}) => {
  return await request<SourceEventType[]>({
    url: "/calendar/list",
    method: "get",
    params: queryInfo,
  });
};

export const addEventInfo = async (eventInfo: Omit<SourceEventType, "id">) => {
  return await request<SourceEventType>({
    url: "/calendar/add",
    method: "post",
    data: eventInfo,
  });
};

export const updateEventInfo = async (eventInfo: SourceEventType) => {
  return await request<SourceEventType>({
    url: "/calendar/update",
    method: "put",
    data: eventInfo,
  });
};

export const removeEventById = async (id: number) => {
  return await request({
    url: "/calendar/delete",
    method: "delete",
    params: { id },
  });
};

export const handleMoveTodoRequest = async (moveInfo: {
  eventId: number;
  folderId: number;
}) => {
  return await request({
    url: "/calendar/moveFolder",
    method: "post",
    data: moveInfo,
  });
};
