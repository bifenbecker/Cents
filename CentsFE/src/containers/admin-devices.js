import { connect } from "react-redux";
import Devices from "../components/admin/devices";
import actionTypes from "../actionTypes";
import { createNamespacer } from "../utils/reducers";
import * as devicesAPI from "../api/admin/devices";
import _ from "lodash";

const businessOwnersNamespacer = createNamespacer("ADMIN_BUSINESS_OWNERS");
const devicesNamespacer = createNamespacer("ADMIN_DEVICES");

const mapStateToProps = state => ({
  businessOwners: state.admin.businessOwners,
  devices: state.admin.devices
});

const mapDispatchToProps = dispatch => ({
  setCurrentBusinessOwner: async (businessId) => {
    const params = {
      businessId
    };
    let res; 
    let data;
    try{
      res = await devicesAPI.fetchBatches(params);
      data = res.data;
    }
    catch(error){
      const devicesError = {
        error: _.get(error, "response.data.error", error.message),
        showError: true
      };
      dispatch({
        type: devicesNamespacer(actionTypes.admin.devices.SET_DEVICES_ERROR),
        payload: {
          value: devicesError
        }
      });
      return;
    }
     

    if (res.data && res.data.success === true) {
      dispatch({
        type: businessOwnersNamespacer(
          actionTypes.admin.businessOwners.SET_CURRENT_BUSINESS_OWNER_ID
        ),
        payload: {
          value: businessId
        }
      });
      dispatch({
        type: businessOwnersNamespacer(
          actionTypes.admin.businessOwners.SET_CURRENT_BUSINESS_OWNER_DATA
        ),
        payload: {
          value: data.businessOwner
        }
      });
    
      // Update batch list
      if ( _.get(res, `data.batchList.length`) !== 0) {
        dispatch({
          type: devicesNamespacer(actionTypes.admin.devices.SET_BATCH_LIST),
          payload: {
            value: data.batchList
          }
        });
      } else {
        const devicesError = {
          error: 
          `No CENTS devices assigned yet.
Upload CSV file with device Ids
          `,
          showError: true
        };
        dispatch({
          type: devicesNamespacer(actionTypes.admin.devices.SET_DEVICES_ERROR),
          payload: {
            value: devicesError
          }
        });
      }
    }
  },

  clearDevices: () => {
    dispatch({
      type: devicesNamespacer(actionTypes.admin.devices.RESET_DEVICES)
    });
  },

  updateCurrentPage: async (businessOwnerId, batchId ,page) => {

    let params = {
      id: batchId,
      page
    }

    try{
      const res = await devicesAPI.fetchDevices(businessOwnerId, params);
      dispatch({
        type: devicesNamespacer(actionTypes.admin.devices.SET_BATCH_DATA),
        payload: {
          value: res.data
        }
      })
    }catch(error){
      console.warn(error);
      const errorData = {
        batchId,
        showError: true
      }
      dispatch({
        type: devicesNamespacer(actionTypes.admin.devices.SET_BATCH_DATA),
        payload: {
          value: errorData
        }
      })
    }
    
  },

  clearCurrentBusinessOwnerId: () => {
    dispatch({
      type: businessOwnersNamespacer(
        actionTypes.admin.businessOwners.CLEAR_CURRENT_BUSINESS_OWNER_ID
      )
    });
  },

  clearCurrentBusinessOwnerData: () => {
    dispatch({
      type: businessOwnersNamespacer(
        actionTypes.admin.businessOwners.CLEAR_CURRENT_BUSINESS_OWNER_DATA
      )
    });
  },

  clearDevicesError: () => {
    dispatch({
      type: devicesNamespacer(actionTypes.admin.devices.RESET_DEVICES_ERROR)
    });
  },

  setUploadProgress: (value) => {
    dispatch({
      type: devicesNamespacer(actionTypes.admin.devices.SET_UPLOAD_PROGRESS),
      payload: value
    });
  },

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Devices);
