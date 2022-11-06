declare namespace API {
  type BaseResponseType<T> = {
    code: number;
    message: string;
    data: T;
  };
}
