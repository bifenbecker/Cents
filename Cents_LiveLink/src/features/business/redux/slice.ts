import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {IBusinessSettings} from "../types";
import {BUSINESS_SETTINGS} from "./constants/general";
import initialData from "./constants/initData";

const businessSettingsSlice = createSlice({
  name: BUSINESS_SETTINGS,
  initialState: initialData,
  reducers: {
    setBusinessSettingsAction: (state: IBusinessSettings, action: PayloadAction<any>) => {
      state.businessSettings.data = action.payload;
    },
  },
});

export const businessSettingsActions = businessSettingsSlice.actions;
export const businessSettingsReducer = businessSettingsSlice.reducer;
