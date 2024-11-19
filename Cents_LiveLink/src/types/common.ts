export enum FetchingStatus {
  Initial,
  Pending,
  Fulfilled,
  Rejected,
}

export interface ISharedReducer {
  fetchingStatus: FetchingStatus;
  error: {
    text?: string;
    code?: string;
  };
}

export interface IGenericReducer<Type> extends ISharedReducer {
  data: Type;
}
