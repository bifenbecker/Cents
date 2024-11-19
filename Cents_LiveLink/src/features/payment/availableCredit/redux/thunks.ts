import {createAsyncThunk} from "@reduxjs/toolkit";

import {IAddCredit} from "../types";
import {fetchAddCredit} from "../api";
import {AVAILABLE_CREDIT, ADD_FUNDS_THUNK} from "./constants/general";

export const addCreditThunk = createAsyncThunk(
  `${AVAILABLE_CREDIT}/${ADD_FUNDS_THUNK}`,
  async (payload: IAddCredit) => {
    const response = await fetchAddCredit(payload);
    return response.data.availableCredits;
  }
);
