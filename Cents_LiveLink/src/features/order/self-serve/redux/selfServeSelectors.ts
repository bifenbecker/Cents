import {createSelector} from "reselect";
import {RootState} from "app/store";

const getSelfServeData = (state: RootState) => state.selfServe;
export const getBusinessTheme = createSelector(getSelfServeData, state => state.theme);
export const getMachineDetails = createSelector(getSelfServeData, state => state.machine);
export const getSelfServeOrder = createSelector(
  getSelfServeData,
  state => state.selfServeOrder
);

export const selfServeSelectors = {
  getSelfServeData,
  getBusinessTheme,
  getMachineDetails,
  getSelfServeOrder,
};
