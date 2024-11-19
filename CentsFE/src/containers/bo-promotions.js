import { connect } from 'react-redux';
import Promotions from '../components/business-owner/global-settings/promotions/promotions';
import { createNamespacer } from '../utils/reducers';
import actionTypes from '../actionTypes';
import { fetchPromotionsList } from '../api/business-owner/promotions';
import { fetchRegions, fetchLocations } from '../api/business-owner/locations';
import _ from 'lodash';

const promotionsAT = actionTypes.businessOwner.globalSettings.promotions;
const promotionsNamespacer = createNamespacer('BO-PROMOTIONS');

const mapStateToProps = (state) => {
  let mapped = {
    ...state.businessOwner.globalSettings.promotions
  }
  delete mapped.activePromotionDetails;
  delete mapped.newPromotionPriceItems;
  return mapped;
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllPromotionsList: async () => {
      try {

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_CALL_PROGRESS),
          payload: true
        });

        const response = await fetchPromotionsList();

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_ALL_PROMOTIONS),
          payload: response.data
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_CALL_PROGRESS),
          payload: false
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_ERROR),
          payload: ""
        });

      } catch (error) {

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_ERROR),
          payload: _.get(error, "response.data.error", "Something went wrong.")
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_CALL_PROGRESS),
          payload: false
        });

      }
    },

    setActivePromotion: async (id) => {

      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_ACTIVE_PROMOTION),
        payload: id
      });

    },

    handlePromotionSearch: async (searchText) => {

      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_PROMOTION_SEARCH_TEXT),
        payload: searchText
      });

    },

    showHideNewPromotionWizard: (value) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_SHOW_NEW_PROMOTION_WIZARD),
        payload: value
      });
    },

    setActiveRoundedTab: (tab) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_ACTIVE_ROUNDED_TAB),
        payload: tab
      });
    },

    setSearchInProgress: (value) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_SEARCH_IN_PROGRESS),
        payload: value
      });
    },

    fetchAllLocations: async () => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.GET_ALL_LOCATIONS_STARTED)
      });

      try{
        let locationsPromise = fetchLocations();
        let regionsPromise = fetchRegions();

        let [locationsResp, regionsResp] = await Promise.all([locationsPromise, regionsPromise]);
        
        let payload = {
          locations: _.get(locationsResp, "data.allLocations"),
          needsRegions: _.get(locationsResp, "data.needsRegions"),
          regions: _.get(regionsResp, "data.regions"),
          storesWithoutRegions: _.get(regionsResp, "data.stores"),
        }

        dispatch({
          type: promotionsNamespacer(promotionsAT.GET_ALL_LOCATIONS_SUCCEEDED),
          payload
        });


      } catch(e) {
        dispatch({
          type: promotionsNamespacer(promotionsAT.GET_ALL_LOCATIONS_SUCCEEDED),
          payload: _.get(e, 'response.data.error', _.get(e, 'message', 'Something went wrong!'))
        });
      }
    },

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Promotions);
