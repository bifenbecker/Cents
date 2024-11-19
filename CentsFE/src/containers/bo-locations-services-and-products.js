import {connect} from "react-redux";
import ServicesAndProducts from "../components/business-owner/global-settings/locations/services-and-products";
import actionTypes from "../actionTypes";
import {createNamespacer} from "../utils/reducers";
import {servicesAndProductsTabValues} from "../constants";

const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");
const locationsAT = actionTypes.businessOwner.globalSettings.locations;

const mapStateToProps = (state) => {
  let locationsData = {...state.businessOwner.globalSettings.locations};
  return {
    activeServicesAndProductsTab: locationsData.activeServicesAndProductsTab,
  };
};

const mapDispatchToProps = (dispatch) => ({
  handleTabChange: (tab) => {
    dispatch({
      type: BoLocationsNamespacer(locationsAT.SET_SERVICES_AND_PRODUCTS_ACTIVE_TAB),
      payload: tab,
    });
  },

  handleUnMount: () => {
    dispatch({
      type: BoLocationsNamespacer(locationsAT.SET_SERVICES_AND_PRODUCTS_ACTIVE_TAB),
      payload: servicesAndProductsTabValues.PER_POUND,
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ServicesAndProducts);
