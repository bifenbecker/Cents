import {createSelector} from "reselect";
import {RootState} from "app/store";

export const getAvailableCreditData = (state: RootState) => state.availableCredit;
export const getFunds = createSelector(getAvailableCreditData, state => state.funds);
