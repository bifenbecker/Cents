import { createNamespacer, createReducer } from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";

const BoGlobalSettingsNamespacer = createNamespacer("BUSINESS_OWNER_GS_DEVICES");
const deviceActionTypes = actionTypes.businessOwner.globalSettings.devices;

const initialState = {
    batchList : [],
    batchListError: "",
    batchListCallInProgess: false,
    locationListCallInProgess: false,
    locationDropDownList: [],
    locationList: [],
    locationListError: "",
    devicesList: {},
    devicesCallInProgress: {},
    selectedItemType: null,
    selectedItem: null,
    chosenLocationItem: null,
    refreshAllLists: false,
    assignLocationError: "",
    isAssignLocationInProgress: false,
};

const handlers = {
    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_BATCH_LIST)]:(
        state,
        action
    )=>{
        if(state.selectedItem === null){
            return {
                ...state,
                batchList: action.payload,
                selectedItem: action.payload[0],
                selectedItemType: "batch"
            }    
        } else if(state.selectedItemType === "batch" && state.selectedItem){
            return {
                ...state,
                batchList: action.payload,
                selectedItem: action.payload.find((batch)=>{return batch.id === state.selectedItem.id})
            }
        }
        return {
            ...state,
            batchList: action.payload
        }
        
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_BATCH_LIST_CALL_IN_PROGRESS)]:(
        state,
        action
    )=>{
        return {
            ...state,
            batchListCallInProgess: action.payload
        }
        
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.RESET_BATCH_LIST)]:(
        state,
        action
    )=>{
        return {
            ...state,
            batchList: initialState.batchList
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_LOCATIONS_LIST)]:(
        state,
        action
    )=>{
        return {
            ...state,
            locationList: action.payload
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_LOCATION_LIST_CALL_IN_PROGRESS)]:(
        state,
        action
    )=>{
        return {
            ...state,
            locationListCallInProgess: action.payload
        }
        
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_BATCH_LIST_ERROR)]:(
        state,
        action
    )=>{
        return {
            ...state,
            batchListError: action.payload
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.RESET_BATCH_LIST_ERROR)]:(
        state,
        action
    )=>{
        return {
            ...state,
            batchListError: initialState.batchListError
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_LOCATIONS_DROPDOWN_LIST)]:(
        state,
        action
    )=>{
        return {
            ...state,
            locationDropDownList: action.payload
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_SELECTED_ITEM)]:(
        state,
        action
    )=>{
        return {
            ...state,
            selectedItemType: action.payload.type,
            selectedItem: action.payload.item
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.RESET_SELECTED_ITEM)]:(
        state,
        action
    )=>{
        return {
            ...state,
            selectedItemType: initialState.selectedItemType,
            selectedItem: initialState.selectedItem
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_CHOSEN_LOCATION_ITEM)]:(
        state,
        action
    )=>{
        return {
            ...state,
            chosenLocationItem: action.payload
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.RESET_CHOSEN_LOCATION_ITEM)]:(
        state,
        action
    )=>{
        return {
            ...state,
            chosenLocationItem: initialState.chosenLocationItem
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.REFRESH_ALL_LISTS)]:(
        state,
        action
    )=>{
        return {
            ...state,
            refreshAllLists: true
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.RESET_REFRESH_ALL_LISTS)]:(
        state,
        action
    )=>{
        return {
            ...state,
            refreshAllLists: initialState.refreshAllLists
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_DEVICES_LIST)]:(
        state,
        action
    )=>{
        let deviceList = {
            ...state.devicesList
        }

        deviceList[action.payload.locationId] = action.payload.deviceList

        return {
            ...state,
            devicesList: deviceList
        }
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_DEVICES_LIST_CALL_IN_PROGRESS)]:(
        state,
        action
    )=>{
        let devicesCallInProgress = { ...state.devicesCallInProgress }
        devicesCallInProgress[action.payload.storeId] = action.payload.value
        return {
            ...state,
            devicesCallInProgress
        }
        
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_ASSIGN_LOCATION_ERROR)]:(
        state,
        action
    )=>{
        return {
            ...state,
            assignLocationError: action.payload.errorMessage
        }
        
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.RESET_ASSIGN_LOCATION_ERROR)]:(
        state,
        action
    )=>{
        return {
            ...state,
            assignLocationError: initialState.assignLocationError
        }
        
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_LOCATIONS_LIST_ERROR)]:(
        state,
        action
    )=>{
        return {
            ...state,
            locationListError: action.payload.errorMessage
        }
        
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.RESET_LOCATIONS_LIST_ERROR)]:(
        state,
        action
    )=>{
        return {
            ...state,
            locationListError: initialState.locationListError
        }
        
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.SET_ASSIGN_LOCATION_PROGRESS)]:(
        state,
        action
    )=>{
        return {
            ...state,
            isAssignLocationInProgress: action.payload
        }
        
    },

    [BoGlobalSettingsNamespacer(deviceActionTypes.RESET_FULL_STATE)]:(
        state,
        action
    )=>{
        return Object.assign({}, initialState);
    },

    
}

export default createReducer(initialState, handlers, ["BUSINESS_OWNER_GS_DEVICES"]);