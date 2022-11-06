import request from "@/utils/request";

import { CosSTSType } from "@/types/upload";

export const getCosConfig = async () => {
  return await request<CosSTSType>({
    url: "/cos/sts",
    method: "get",
  });
};
