import {createAsyncThunk} from "@reduxjs/toolkit";

import {ISelfServeOrder} from "../types";
import {
  fetchBusinessThemeByUniqueCode,
  fetchMachineDataByUniqueCode,
  fetchSendSelfServeOrder,
} from "../api/selfServe";
import {
  SELF_SERVE_REDUCER,
  MACHINE_DATA_THUNK,
  BUSINESS_THEME_THUNK,
  DATA_ORDER_THUNK,
} from "../constants/selfServeGeneral";

export const getMachineDataByUniqueCode = createAsyncThunk(
  `${SELF_SERVE_REDUCER}/${MACHINE_DATA_THUNK}`,
  async (uniqueCode: string) => {
    const response = await fetchMachineDataByUniqueCode(uniqueCode);
    return response.data;
  }
);

export const getBusinessThemeByUniqueCode = createAsyncThunk(
  `${SELF_SERVE_REDUCER}/${BUSINESS_THEME_THUNK}`,
  async (uniqueCode: string) => {
    const response = await fetchBusinessThemeByUniqueCode(uniqueCode);
    return response.data.theme;
  }
);

export const sendSelfServeOrder = createAsyncThunk(
  `${SELF_SERVE_REDUCER}/${DATA_ORDER_THUNK}`,
  async (payload: ISelfServeOrder) => {
    const response = await fetchSendSelfServeOrder(payload);
    return response.data.turnId;
  }
);
