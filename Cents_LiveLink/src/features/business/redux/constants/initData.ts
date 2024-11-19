import {FetchingStatus} from "types/common";
import {IBusinessSettings} from "../../types";

const initialData: IBusinessSettings = {
  businessSettings: {
    data: {
      allowInStoreTip: false,
      businessId: null,
      createdAt: null,
      dryCleaningEnabled: false,
      hangDryInstructions: null,
      hasConvenienceFee: false,
      id: null,
      isBagTrackingEnabled: false,
      isCustomPreferencesEnabled: false,
      isCustomUrl: false,
      isHangDryEnabled: false,
      isWeightAfterProcessing: false,
      isWeightBeforeProcessing: false,
      isWeightDuringIntake: false,
      isWeightReceivingAtStore: false,
      isWeightUpOnCompletion: false,
      receiptFooterMessage: "Thank you for your order.",
      requiresEmployeeCode: false,
      requiresRack: false,
      salesWeight: null,
      termsOfServiceUrl: null,
      updatedAt: null,
    },
    fetchingStatus: FetchingStatus.Initial,
    error: {
      text: "",
      code: "",
    },
  },
};

export default initialData;
