import {createAsyncThunk} from "@reduxjs/toolkit";

import {IFetchBusinessSettings} from "../types";
import {fetchBusinessSettings} from "../../../api/business.js";
import {BUSINESS_SETTINGS, SET_BUSINESS_SETTINGS_THUNK} from "./constants/general";

export const setBusinessSettingsThunk = createAsyncThunk(
  `${BUSINESS_SETTINGS}/${SET_BUSINESS_SETTINGS_THUNK}`,
  async (payload: IFetchBusinessSettings) => {
    const response = await fetchBusinessSettings(payload);
    return response.data.businessSettings;
  }
);
