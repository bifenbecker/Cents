import { connect } from 'react-redux';
import { createNamespacer } from '../utils/reducers';
import actionTypes from '../actionTypes';
import { fetchPromotionDetails as promotionDetailsApi, updatePromotionDetails} from '../api/business-owner/promotions';
import _ from 'lodash';
import PromotionDetails from '../components/business-owner/global-settings/promotions/promotion-details';

const promotionsAT = actionTypes.businessOwner.globalSettings.promotions;
const promotionsNamespacer = createNamespacer('BO-PROMOTIONS');

const mapStateToProps = (state) => {
  let mapped = {
    ...state.businessOwner.globalSettings.promotions
  }
  delete mapped.newPromotionPriceItems;
  return mapped;
}

const updateActivePromoDetails = async (id, data, shouldPut, dispatch) => {
  // Data correction logic goes here

  if(Object.keys(data).includes('customerRedemptionLimit') && !shouldPut){
    dispatch({
      type: promotionsNamespacer(promotionsAT.SET_CUST_LIMIT_COPY),
      payload: data.customerRedemptionLimit,
    });
  } else {
    if(Object.keys(data).includes('customerRedemptionLimit')){
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_CUST_LIMIT_COPY),
        payload: data.customerRedemptionLimit,
      });
    }
    dispatch({
      type: promotionsNamespacer(promotionsAT.ACTIVE_PROMO_DETAILS_CHANGED),
      payload: data,
    });
  }

  if(Object.keys(data).includes('discountValue')){
    data.discountValue = Number(data.discountValue);
  }

  if(Object.keys(data).includes('storePromotions')){
    data.storePromotions = data.storePromotions.map(store => store.storeId);
  }

  if(shouldPut){
    try{
      let resp = await updatePromotionDetails(id, data);
      // Clean up the errors
      let errorPayload = {};
      
      Object.keys(data).forEach( key => {
        errorPayload[key] = undefined;
      });


      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_UPDATE_ERRORS),
        payload: errorPayload
      })

      // Update the list data
      if(Object.keys(data).includes('name')) {
        dispatch({
          type: promotionsNamespacer(promotionsAT.UPDATE_PROMO_DETAIL_IN_LIST),
          payload: {
            name: data.name,
            id,
          },
        });
      } else if(Object.keys(data).includes('discountValue')) {
        if(!_.get(resp, "data.promotionProgram.balanceRule")){
          return;
        }
        dispatch({
          type: promotionsNamespacer(promotionsAT.UPDATE_PROMO_DETAIL_IN_LIST),
          payload: {
            balanceRule: _.get(resp, "data.promotionProgram.balanceRule"),
            id,
          },
        });
      } else if(Object.keys(data).includes('active')) {
        dispatch({
          type: promotionsNamespacer(promotionsAT.UPDATE_PROMO_DETAIL_IN_LIST),
          payload: {
            active: data.active,
            id,
          },
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_ACTIVE_ROUNDED_TAB),
          payload: data.active ? 'active' : 'inactive',
          preventAutoSelect: true,
        });
      }
    } catch(e) {

      let errorPayload = {};
      let errorMessage = _.get(e, "response.data.error", _.get(e, "message", "Something went wrong"));

      Object.keys(data).forEach( key => {
        errorPayload[key] = errorMessage;
      });


      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_UPDATE_ERRORS),
        payload: errorPayload
      })
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getPromotionDetails: async (promotionId) => {

      dispatch({
        type: promotionsNamespacer(promotionsAT.GET_PROMOTION_DETAILS_STARTED),
      });

      try{
        let promotionDetailsResp = await promotionDetailsApi(promotionId);

        let respData = promotionDetailsResp.data;
        
        let insights = {...respData}
        delete insights.promotionProgram
        delete insights.success

        dispatch({
          type: promotionsNamespacer(promotionsAT.GET_PROMOTION_DETAILS_SUCCEEDED),
          payload: {
            details: _.get(promotionDetailsResp, "data.promotionProgram"),
            insights,
          }
        });
      } catch(e) {
        dispatch({
          type: promotionsNamespacer(promotionsAT.GET_PROMOTION_DETAILS_FAILED),
          payload: _.get(e, "response.data.error", _.get(e, "message", "Something went wrong!"))
        });
      }
    },

    toggleServiceProductPicker: (isVisible) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_DETAILS_PRODUCT_PICKER_VISIBILITY),
        payload: isVisible,
      })
    },

    resetServicesProductsData: () => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_DETAILS_PRODUCT_PICKER_VISIBILITY),
        payload: false,
      });

      dispatch({
        type: promotionsNamespacer(promotionsAT.CLEAR_SERVICES_AND_PRODUCTS_DATA),
      });
    },

    handleActivePromoDetailsChange: (id, data, shouldPut) => {
      updateActivePromoDetails(id, data, shouldPut, dispatch); // Logic moved to a separate func to re use.
    },

    handleHasDetailsEndDateChange: (id, hasEndDate) => {
      
      if(!hasEndDate){
        updateActivePromoDetails(id, {
          endDate: null,
        }, true, dispatch);
      }
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_DETAILS_HAS_END_DATE),
        payload: hasEndDate,
      });
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PromotionDetails);
