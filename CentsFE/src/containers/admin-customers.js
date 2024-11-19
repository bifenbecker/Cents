import { connect } from "react-redux";
import Customers from "../components/admin/customers";
import actionTypes from "../actionTypes";
import { createNamespacer } from "../utils/reducers";
import * as businessOwnersAPI from "../api/admin/businessOwners";
import _ from "lodash"

const businessOwnersNamespacer = createNamespacer("ADMIN_BUSINESS_OWNERS");

const mapStateToProps = state => ({
  businessOwners: state.admin.businessOwners
});

const mapDispatchToProps = dispatch => ({
  fetchBusinessOwners: async page => {
    
    dispatch({
      type: businessOwnersNamespacer(actionTypes.admin.businessOwners.REFRESH_CUSTOMER_LIST),
      payload: false
    });

    try {
      const params = {
        page
      };
      const res = await businessOwnersAPI.fetchBusinessOwners(params);
      const data = res.data.businessOwners;
      const totalPage = res.data.totalpage;

      if (data && data.length !== 0) {
        dispatch({
          type: businessOwnersNamespacer(
            actionTypes.admin.businessOwners.FETCH_BUSINESS_OWNERS
          ),
          payload: {
            value: {
              data,
              totalPage
            }
          }
        });
      } else if (data && data.length === 0) {
        const error = {
          showError: true,
          error: "No customer records found"
        };
        dispatch({
          type: businessOwnersNamespacer(
            actionTypes.admin.businessOwners.SET_BUSINESS_OWNERS_ERROR
          ),
          payload: {
            value: error
          }
        });
      }
    } catch (err) {
      const error = {
        showError: true,
        error: err.message
      };
      dispatch({
        type: businessOwnersNamespacer(
          actionTypes.admin.businessOwners.SET_BUSINESS_OWNERS_ERROR
        ),
        payload: {
          value: error
        }
      });
    }
  },

  updateCurrentPage: page => {
    dispatch({
      type: businessOwnersNamespacer(
        actionTypes.admin.businessOwners.UPDATE_CURRENT_PAGE
      ),
      payload: {
        value: page
      }
    });
  },

  showCreateCustomerModal: () => {
    dispatch({
      type: businessOwnersNamespacer(actionTypes.admin.businessOwners.SHOW_HIDE_CREATE_CUSTOMER_MODAL),
      payload: true
    });
  },

  cancelCreateCustomerModal: () => {

    dispatch({
      type: businessOwnersNamespacer(actionTypes.admin.businessOwners.SHOW_HIDE_CREATE_CUSTOMER_MODAL),
      payload: false
    });
  },

  submitNewCustomer: async (data) => {
    try{
      data.userType = "Business Owner" // Default type
      let resp = await businessOwnersAPI.submitNewCustomer(data)
      if(_.get(resp, "data.success")){
        
        dispatch({
          type: businessOwnersNamespacer(actionTypes.admin.businessOwners.REFRESH_CUSTOMER_LIST),
          payload: true
        });

        dispatch({
          type: businessOwnersNamespacer(actionTypes.admin.businessOwners.SHOW_HIDE_CREATE_CUSTOMER_MODAL),
          payload: false
        });

        dispatch({
          type: businessOwnersNamespacer(actionTypes.admin.businessOwners.SET_CREATE_CUSTOMER_ERROR),
          payload: {
            errorMessage: ""
          }
        });
      }
    }
    catch(error){

      dispatch({
        type: businessOwnersNamespacer(actionTypes.admin.businessOwners.SET_CREATE_CUSTOMER_ERROR),
        payload: {
          errorMessage: _.get(error, "response.data.error", "Something went wrong")
        }
      });
    
    }
    
  
  }


});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Customers);
