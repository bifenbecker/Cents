import {IGenericReducer} from "types/common";

export interface IAddCredit {
  paymentMethodToken: string;
  credits: number;
  storeId: number;
}

export interface ICredit {
  amount: number | null;
}

export interface IAvailableCredit {
  funds: IGenericReducer<ICredit>;
}
