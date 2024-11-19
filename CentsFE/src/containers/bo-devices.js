import { connect } from "react-redux";
import Devices from '../components/business-owner/global-settings/devices/devices';
import actionTypes from "../actionTypes";
import { createNamespacer } from "../utils/reducers";
import * as devicesApi from "../api/business-owner/devices";
import * as locationsApi from "../api/business-owner/locations";
import _ from 'lodash';

const BoDevicesNamespacer = createNamespacer("BUSINESS_OWNER_GS_DEVICES");

const deviceActionTypes = actionTypes.businessOwner.globalSettings.devices;

const mapStateToProps = state => ({
    devices: state.businessOwner.globalSettings.devices
}); 


const mapDispatchToProps = dispatch => ({

    fetchAllBatches: async () => {
        try{
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_BATCH_LIST_CALL_IN_PROGRESS),
                payload: true
            })
            let res = await devicesApi.fetchBatches();
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_BATCH_LIST_CALL_IN_PROGRESS),
                payload: false
            })

            if(res.status === 200 && _.get(res, "data.success")){
                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.SET_BATCH_LIST),
                    payload: _.get(res, "data.batchList")
                })
                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.RESET_BATCH_LIST_ERROR)
                })
            }
            else{
                // SET Error
                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.SET_BATCH_LIST_ERROR),
                    payload: "Something went wrong!"
                })
            }
        }catch(error){
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_BATCH_LIST_CALL_IN_PROGRESS),
                payload: false
            })
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_BATCH_LIST_ERROR),
                payload: `Something went wrong!
                ${error.message}`
            })
        }

    },

    fetchDropdownLocations: async () => {
        try{
            
            let res = await locationsApi.fetchLocations();
            if(res.status === 200){
                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.SET_LOCATIONS_DROPDOWN_LIST),
                    payload: _.get(res, "data.allLocations")
                })
            }
            else{
                // SET Error
                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.SET_BATCH_LIST_ERROR),
                    payload: "Something went wrong!"
                })
            }
        }catch(error){
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_BATCH_LIST_ERROR),
                payload: `Something went wrong!
                ${error.message}`
            })
        }
    },

    fetchLocations: async () => {
        try{
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_LOCATION_LIST_CALL_IN_PROGRESS),
                payload: true
            })

            let res = await locationsApi.fetchLocations({deviceCount: true});

            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_LOCATION_LIST_CALL_IN_PROGRESS),
                payload: false
            })

            if(res.status === 200){
                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.SET_LOCATIONS_LIST),
                    payload: _.get(res, "data.allLocations")
                })

                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.RESET_LOCATIONS_LIST_ERROR)
                })
            }
            else{
                // SET Error
                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.SET_LOCATIONS_LIST_ERROR),
                    payload: {
                        errorMessage: "Something went wrong!"
                    }
                })
     
            }
        }catch(error){
            // SET Error
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_LOCATIONS_LIST_ERROR),
                payload: {
                    errorMessage: `Something went wrong! ${error.message}`
                }
            })

            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_LOCATION_LIST_CALL_IN_PROGRESS),
                payload: false
            })
            
        }
    },

    // Valid item types are 
    // 1. batch
    // 2. device
    setSelectedItem: (type, item) => {

        dispatch({
            type: BoDevicesNamespacer(deviceActionTypes.RESET_CHOSEN_LOCATION_ITEM)
        })

        dispatch({
            type: BoDevicesNamespacer(deviceActionTypes.RESET_ASSIGN_LOCATION_ERROR)
        })

        dispatch({
            type: BoDevicesNamespacer(deviceActionTypes.SET_SELECTED_ITEM),
            payload: {
                type,
                item
            }
        })
    },

    fetchDevices: async (locationId) => {
        try{
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_DEVICES_LIST_CALL_IN_PROGRESS),
                payload: {
                    storeId: locationId,
                    value: true
                }
            })
            let res = await devicesApi.fetchDevices({id:locationId});

            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_DEVICES_LIST_CALL_IN_PROGRESS),
                payload: {
                    storeId: locationId,
                    value: false
                }
            })
            if(res.status === 200){
                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.SET_DEVICES_LIST),
                    payload: {
                        locationId,
                        deviceList: _.get(res, "data.devices")
                    }
                })
            }
            else{
                // SET Error
                
            }
        }catch(error){
            // SET Error
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_DEVICES_LIST_CALL_IN_PROGRESS),
                payload: {
                    storeId: locationId,
                    value: false
                }
            })
        }
    },

    locationDropdownChangeHandler: (selectedItem) => {
        dispatch({
            type: BoDevicesNamespacer(deviceActionTypes.SET_CHOSEN_LOCATION_ITEM),
            payload: selectedItem
        })
    },

    submitSetLocation: async (batchId, locationId) => {
        try{

            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_ASSIGN_LOCATION_PROGRESS),
                payload: true
            })

            let res = await devicesApi.assignBatchToLocation(batchId, locationId);

            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_ASSIGN_LOCATION_PROGRESS),
                payload: false
            })

            if(res.status === 200){
                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.RESET_CHOSEN_LOCATION_ITEM)
                })

                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.REFRESH_ALL_LISTS)
                })

                dispatch({
                    type: BoDevicesNamespacer(deviceActionTypes.RESET_ASSIGN_LOCATION_ERROR)
                })
            }
        }
        catch(error){
            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_ASSIGN_LOCATION_ERROR),
                payload:{
                    errorMessage: `Something went wrong! ${error.message}`
                }
            })

            dispatch({
                type: BoDevicesNamespacer(deviceActionTypes.SET_ASSIGN_LOCATION_PROGRESS),
                payload: false
            })
        }

    },

    resetRefreshAllLists: ( ) => {
        dispatch({
            type: BoDevicesNamespacer(deviceActionTypes.RESET_REFRESH_ALL_LISTS)
        })
    },

    resetFullState: () =>{
        dispatch({
            type: BoDevicesNamespacer(deviceActionTypes.RESET_FULL_STATE)
        })
    },


});


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Devices);