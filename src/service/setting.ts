import request from "@/utils/request";
import { Setting } from "@/types/setting/calendar";

export const getSettingInfo = async () => {
  return await request<Setting>({ url: "/setting/userSetting", method: "get" });
};

export const handleSaveSetting = async (data: Setting) => {
  return await request({ url: "/setting/save", method: "post", data });
};
