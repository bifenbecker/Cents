import {IGenericReducer} from "types/common";

export interface IBusinessSettingsData {
  allowInStoreTip: boolean;
  businessId: number | null;
  createdAt: string | null;
  dryCleaningEnabled: boolean;
  hangDryInstructions: string | null;
  hasConvenienceFee: boolean;
  id: number | null;
  isBagTrackingEnabled: boolean;
  isCustomPreferencesEnabled: boolean;
  isCustomUrl: boolean;
  isHangDryEnabled: boolean;
  isWeightAfterProcessing: boolean;
  isWeightBeforeProcessing: boolean;
  isWeightDuringIntake: boolean;
  isWeightReceivingAtStore: boolean;
  isWeightUpOnCompletion: boolean;
  receiptFooterMessage: string | null;
  requiresEmployeeCode: boolean;
  requiresRack: boolean;
  salesWeight: string | null;
  termsOfServiceUrl: string | null;
  updatedAt: string | null;
}

export interface IBusinessSettings {
  businessSettings: IGenericReducer<IBusinessSettingsData>;
}

export interface IFetchBusinessSettings {
  businessId: number;
}
