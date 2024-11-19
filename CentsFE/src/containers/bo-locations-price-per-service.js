import { connect } from "react-redux";
import PricePerService from '../components/business-owner/global-settings/locations/price-per-service';
import actionTypes from "../actionTypes";
import { createNamespacer } from "../utils/reducers";
import * as locationsApi from "../api/business-owner/locations";
import {updateSingleServicePriceField} from "../api/business-owner/services";
import _ from 'lodash';

const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");
const locationsAT = actionTypes.businessOwner.globalSettings.locations;

const putServicePrice = async (storeId, serviceId, field, value, dispatch) => {
  try{
    let data = {storeId, serviceId, field, value}
    await updateSingleServicePriceField(data);
    dispatch({
      type: BoLocationsNamespacer(locationsAT.SET_SERVICE_PRICES_UPDATE_ERROR),
      payload: ''
    });
  }
  catch(e){
    dispatch({
      type: BoLocationsNamespacer(locationsAT.SET_SERVICE_PRICES_UPDATE_ERROR),
      payload: _.get(e, "response.data.error", `Failed to update ${field}`),
    });
  }
};

const mapStateToProps = state => ({
    locations: state.businessOwner.globalSettings.locations,
});


const mapDispatchToProps = dispatch => ({

  fetchServicesOfLocation: async (locationId) => {
    // make api call and set data to store.
    try{
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_LOADING),
        payload: true,
      });
      let resp = await locationsApi.fetchServicesOfLocation(locationId);
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_ACTIVE_LOCATION_SERVICES),
        payload: _.get(resp, "data.services", []),
      });
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_ERROR),
        payload: '',
      });
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_LOADING),
        payload: false,
      });
    }
    catch(e){
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_ERROR),
        payload: _.get(e, "response.data.error", "Unable to fetch services"),
      });
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_LOADING),
        payload: false,
      });
    }
  },

  handleCancel: () => {
    dispatch({
      type: BoLocationsNamespacer(locationsAT.CLOSE_SERVICE_PRICE),
    })
  },

  handleSave: async(locationId, services) => {
    try{
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_LOADING),
        payload: true,
      });
      await locationsApi.updateServicesOfLocation(locationId, services);
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_ERROR),
        payload: '',
      });
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_LOADING),
        payload: false,
      });
      dispatch({
        type: BoLocationsNamespacer(locationsAT.CLOSE_SERVICE_PRICE),
      });
      dispatch({
        type: BoLocationsNamespacer(locationsAT.REFRESH_ACTIVE_LOCATION_DETAILS),
        payload: true,
      });
    }
    catch(e){
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_ERROR),
        payload: _.get(e, "response.data.error", "Couldn't update service"),
      });
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SERVICES_CALL_LOADING),
        payload: false,
      });
    }
  },

  handleChange: (categoryId, serviceId, field, value, storeId, shouldSubmit) => {
    if(shouldSubmit){
      putServicePrice(storeId, serviceId, field, value, dispatch);
    }
    dispatch({
      type: BoLocationsNamespacer(locationsAT.UPDATE_SERVICE_PRICE),
      payload: {
        categoryId,
        serviceId,
        storeId,
        field,
        value,
      }
    })
  }
    
});


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PricePerService);