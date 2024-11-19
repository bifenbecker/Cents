import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {FetchingStatus} from "types/common";
import {AVAILABLE_CREDIT} from "./constants/general";
import initialData from "./constants/initData";
import {addCreditThunk} from "./thunks";

const availableCreditSlice = createSlice({
  name: AVAILABLE_CREDIT,
  initialState: initialData,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addCreditThunk.pending, state => {
        state.funds.fetchingStatus = FetchingStatus.Pending;
      })
      .addCase(addCreditThunk.fulfilled, (state, action: PayloadAction<number>) => {
        state.funds.fetchingStatus = FetchingStatus.Fulfilled;
        state.funds.data.amount = action.payload;
      })
      .addCase(addCreditThunk.rejected, (state, action) => {
        const {error} = action;
        state.funds.fetchingStatus = FetchingStatus.Rejected;
        state.funds.error = {
          text: error.message,
          code: error.name,
        };
      });
  },
});

export const availableCreditActions = availableCreditSlice.actions;
export const availableCreditReducer = availableCreditSlice.reducer;
