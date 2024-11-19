import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {FetchingStatus} from "types/common";
import {SELF_SERVE_REDUCER} from "../constants/selfServeGeneral";
import initialData from "../constants/selfServeInitData";
import {ITheme, ISelfServe} from "../types";
import {
  getMachineDataByUniqueCode,
  getBusinessThemeByUniqueCode,
  sendSelfServeOrder,
} from "./selfServeThunks";

const selfServeSlice = createSlice({
  name: SELF_SERVE_REDUCER,
  initialState: initialData,
  reducers: {
    setSelfServeData: (state: ISelfServe, action: PayloadAction<number>) => {
      state.machine.data.id = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getMachineDataByUniqueCode.pending, state => {
        state.machine.fetchingStatus = FetchingStatus.Pending;
      })
      .addCase(getMachineDataByUniqueCode.fulfilled, (state, action) => {
        state.machine.fetchingStatus = FetchingStatus.Fulfilled;
        state.machine.data = {...initialData.machine.data, ...action.payload};
      })
      .addCase(getMachineDataByUniqueCode.rejected, (state, action) => {
        const {error} = action;
        state.machine.fetchingStatus = FetchingStatus.Rejected;
        state.machine.error = {
          text: error.message,
          code: error.name,
        };
      })

      .addCase(getBusinessThemeByUniqueCode.pending, state => {
        state.theme.fetchingStatus = FetchingStatus.Pending;
      })
      .addCase(
        getBusinessThemeByUniqueCode.fulfilled,
        (state, action: PayloadAction<ITheme>) => {
          state.theme.fetchingStatus = FetchingStatus.Fulfilled;
          state.theme.data = {...initialData.theme.data, ...action.payload};
        }
      )
      .addCase(getBusinessThemeByUniqueCode.rejected, (state, action) => {
        const {error} = action;
        state.theme.fetchingStatus = FetchingStatus.Rejected;
        state.theme.error = {
          text: error.message,
          code: error.name,
        };
      })

      .addCase(sendSelfServeOrder.pending, state => {
        state.selfServeOrder.fetchingStatus = FetchingStatus.Pending;
      })
      .addCase(sendSelfServeOrder.fulfilled, (state, action: PayloadAction<number>) => {
        state.selfServeOrder.fetchingStatus = FetchingStatus.Fulfilled;
        state.selfServeOrder.data.turnId = action.payload;
      })
      .addCase(sendSelfServeOrder.rejected, (state, action) => {
        const {error} = action;
        state.selfServeOrder.fetchingStatus = FetchingStatus.Rejected;
        state.selfServeOrder.error = {
          text: error.message,
          code: error.name,
        };
      });
  },
});

export const selfServeActions = selfServeSlice.actions;
export const selfServeReducer = selfServeSlice.reducer;
