import {IGenericReducer} from "types/common";

export interface ISelfServeOrder {
  machineId: number;
  quantity: number | null;
  promotionId?: number;
}

export interface IMachine {
  id: number | null;
  store: {
    id: number | null;
    address: string;
    name: string;
  };
  name: string;
  prefix: string;
  pricePerTurnInCents: number | null;
  turnTimeInMinutes: number | null;
  serialNumber: string | null;
  model: {
    capacity: string;
    manufacturer: string;
    modelName: string;
    type: string;
  };
  business: {
    id: number | null;
  };
  activeTurn?: {
    id: number;
    serviceType: string;
    storeCustomerId: number;
  };
  isAvailable: boolean;
}

export interface ITheme {
  id: number | null;
  businessName: string;
  businessId: number | null;
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
  normalFont: string;
  boldFont: string;
  active: boolean | null;
}

export interface IOrder {
  turnId: number | null;
}

export interface ISelfServe {
  machine: IGenericReducer<IMachine>;
  theme: IGenericReducer<ITheme>;
  selfServeOrder: IGenericReducer<IOrder>;
}
