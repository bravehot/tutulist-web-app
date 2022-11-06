export type CosSTSType = {
  credentials: {
    tmpSecretId: string;
    tmpSecretKey: string;
    sessionToken: string;
  };
  startTime: string;
  expiredTime: string;
};
