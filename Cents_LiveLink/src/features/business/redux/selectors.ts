import {createSelector} from "reselect";
import {RootState} from "app/store";

export const getBusinessSettings = (state: RootState) => state.businessSettings;
export const getBusinessSettingsFromRedux = createSelector(
  getBusinessSettings,
  (state) => state.businessSettings.data
);
