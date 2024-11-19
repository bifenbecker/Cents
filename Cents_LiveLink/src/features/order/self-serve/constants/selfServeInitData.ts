import {FetchingStatus} from "types/common";
import {ISelfServe} from "../types";

const initialData: ISelfServe = {
  machine: {
    data: {
      id: null,
      store: {
        id: null,
        address: "",
        name: "",
      },
      business: {
        id: null,
      },
      name: "",
      prefix: "",
      serialNumber: null,
      pricePerTurnInCents: null,
      turnTimeInMinutes: null,
      model: {
        capacity: "",
        modelName: "",
        manufacturer: "",
        type: "",
      },

      isAvailable: false,
    },
    fetchingStatus: FetchingStatus.Initial,
    error: {
      text: "",
      code: "",
    },
  },
  theme: {
    data: {
      active: null,
      boldFont: "",
      borderRadius: "",
      businessId: null,
      businessName: "",
      createdAt: "",
      id: null,
      logoUrl: "",
      normalFont: "",
      primaryColor: "",
      secondaryColor: "",
      updatedAt: "",
    },
    fetchingStatus: FetchingStatus.Initial,
    error: {
      text: "",
      code: "",
    },
  },
  selfServeOrder: {
    data: {
      turnId: null,
    },
    fetchingStatus: FetchingStatus.Initial,
    error: {
      text: "",
      code: "",
    },
  },
};

export default initialData;
