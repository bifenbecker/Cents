import { createNamespacer, createReducer } from "../../utils/reducers";
import actionTypes from "../../actionTypes";
import { run_machine_wash_type } from "../../constants";

const boMachinesNameSpacer = createNamespacer("BUSINESS_OWNER_MACHINES");

const initialState = {
    deviceList: [],
    isDevicesCallInProgress: false,
    devicesError: "",
    machineList: [],
    refreshData: false,
    isMachinesCallInProgress: false,
    machinesError: "",
    selectedItem: null,
    selectedItemType: "",
    wizardData: {
        // Machine pairing wizard data
        step: 0,
        selectedMachineType: "washer",
        selectedMachineModel: "",
        pricePerLoad: {},
        machineModels: {
            washer: null,
            dryer: null
        },
        machineModelsError: "",
        loadTypes:{},
        loadTypesError: "",
        pairingError: ""
    },
    showMachineMenu: false,
    runMachineStatus: {},
    showRunMachineWizard: false,
    runMachineWizardStep: 0,
    runMachineWizardData: {
        washType: run_machine_wash_type.TECHNICAL,
        customer: null,
        technicianName: '',
        reason: '',
        notes: '',
        currentSetting: '',
        cycleValue: '',
        newCustomer: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: ''
        },
        newCustomerError: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: ''
        },
        createCustomerCallInProgress: false,
        createCustomerFullPageError: '',
    },
    runMachineErrorMessage: '',
    runWizardCustomerSearchList: [],

};

const handlers = {
    
    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_DEVICE_LIST)]: (state, action) => {
        return {
            ...state,
            deviceList: action.payload
        }        
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_DEVICE_CALL_PROGRESS)]: (state, action) => {
        return {
            ...state,
            isDevicesCallInProgress: action.payload
        }
    },


    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_DEVICES_ERROR)]: (state, action) => {
        return {
            ...state,
            devicesError: action.payload
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_LIST)]: (state, action) => {
        return {
            ...state,
            machineList: action.payload
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_CALL_PROGRESS)]: (state, action) => {
        return {
            ...state,
            isMachinesCallInProgress: action.payload
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_LIST_ERROR)]: (state, action) => {
        return {
            ...state,
            machinesError: action.payload
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SELECTED_ITEM)]: (state, action) => {
        return {
            ...state,
            selectedItem: action.payload
        }
    },

    // Should be only device or machine
    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SELECTED_ITEM_TYPE)]: (state, action) => {
        return {
            ...state,
            selectedItemType: action.payload
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.UPDATE_WIZARD)]: (state, action) => {
        let wizardData = { ...state.wizardData};
        wizardData.step = action.payload.nextStep;
        switch(action.payload.field){
            case "selectedMachineType":
                // Value should contain selected machine type so update it
                wizardData.selectedMachineType = action.payload.value;
                break;
            case "selectedMachineModel":
                // Update selected model
                wizardData.selectedMachineModel = action.payload.value;
                break;
            case "pricePerLoad": 
                // Update price per laod
                wizardData.pricePerLoad = {
                    ...wizardData.pricePerLoad,
                    [action.payload.value.type]: action.payload.value.value
                }
                break;
            default:
                break;
        }

        return {
            ...state,
            wizardData 
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_WIZARD_DATA)]: (state, action) => {
        let wizardData = initialState.wizardData;
        // These two pieces of data will not change base on the device or location so retaining them
        wizardData.machineModels = Object.assign({},state.wizardData.machineModels);
        wizardData.loadTypes = Object.assign({},state.wizardData.loadTypes);
        
        return {
            ...state,
            wizardData 
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_MODEL_LIST)]: (state, action) => {
        
        let modelLists = {
            ...state.wizardData.machineModels,
            [action.payload.type]: action.payload.list
        }
       
        let wizardData = {
            ...state.wizardData,
            machineModels: modelLists
        }

        return {
            ...state,
            wizardData
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_MODEL_LIST_ERROR)]: (state, action) => {
        let wizardData = {...state.wizardData}
        wizardData.machineModelsError = action.payload;
        return {
            ...state,
            wizardData
        }
    },


    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MODEL_LOAD_TYPES)]: (state, action) => {
        
        let loadTypes = {
            ...state.wizardData.loadTypes,
            [action.payload.modelId]: action.payload.list
        }
       
        let wizardData = {
            ...state.wizardData,
            loadTypes: loadTypes
        }

        return {
            ...state,
            wizardData
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MODEL_LOAD_TYPES_ERROR)]: (state, action) => {
        
        let wizardData = {
            ...state.wizardData,
            loadTypesError: action.payload
        }

        return {
            ...state,
            wizardData
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_MACHINES_STATE)]: (state, action) => {
        return Object.assign({},initialState);
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_PAIRING_ERROR)]: (state, action) => {
        let wizardData = {...state.wizardData}
        wizardData.pairingError = action.payload;;
        return {
            ...state,
            wizardData
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.REFRESH_DATA)]: (state, action) => {
        
        return {
            ...state,
            refreshData: action.payload
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.AUTO_SELECT_ITEM)]: (state, action) => {
        let selectedItem;
        let selectedItemType;

        if(state.deviceList.length > 0){
            selectedItemType = "device";
            selectedItem = state.deviceList[0];
        }
        else if(state.machineList.length > 0){
            selectedItemType = "machine";
            selectedItem = state.machineList[0];
        }
        else{
            selectedItem = null;
            selectedItemType = "";
        }
                
        return {
            ...state,
            selectedItemType,
            selectedItem
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.TOGGLE_MACHINE_MENU)]: (state, action) => { 
        return {
            ...state,
            showMachineMenu: !state.showMachineMenu,
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.UPDATE_MACHINE_STATUS)]: (state, action) => { 
        let machineList = state.machineList.slice();

        machineList.forEach(machine => {
            if(machine.id === action.payload.id){
                machine.status = action.payload.status
            }
        });

        return {
            ...state,
            machineList
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.UPDATE_DEVICE_STATUS)]: (state, action) => { 
        let deviceList = state.deviceList.slice();

        deviceList.forEach(device => {
            if(device.id === action.payload.id){
                device.status = action.payload.status
            }
        });

        return {
            ...state,
            deviceList
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_RUN_MACHINE_STATUS)]: (state, action) => { 
        
        let runMachineStatus = {...state.runMachineStatus};

        runMachineStatus[action.payload.machineId] = action.payload.status;

        return {
            ...state,
            runMachineStatus
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SHOW_RUN_WIZARD)]: (state, action) => { 
        return {
            ...state,
            showRunMachineWizard: action.payload
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_RUN_WIZARD_STEP)]: (state, action) => { 
        if(state.runMachineWizardStep > action.payload){
            let wizardData = {
                ...initialState.runMachineWizardData,
                washType: state.runMachineWizardData.washType
            }

            return {
                ...state,
                runMachineWizardStep: action.payload,
                runMachineWizardData: wizardData,
            }
        }
        return {
            ...state,
            runMachineWizardStep: action.payload
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_RUN_WIZARD_DATA_FIELD)]: (state, action) => { 
        let value = action.payload.value;
        if(action.payload.field === 'newCustomer'){
            value = {
                ...state.runMachineWizardData.newCustomer,
                ...action.payload.value
            }
        }
        return {
            ...state,
            runMachineWizardData: {
                ...state.runMachineWizardData,
                [action.payload.field]: value
            }
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_RUN_WIZARD)]: (state, action) => { 
        return {
            ...state,
            runMachineWizardData: {...initialState.runMachineWizardData},
            runMachineWizardStep: initialState.runMachineWizardStep,
            showRunMachineWizard: initialState.showRunMachineWizard,
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_WIZ_CUSTOMER_SEARCH_LIST)]: (state, action) => { 
        return {
            ...state,
            runWizardCustomerSearchList: action.payload
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_NEW_CUSTOMER_ERROR)]: (state, action) => { 
        return {
            ...state,
            runMachineWizardData: {
                ...state.runMachineWizardData,
                newCustomerError: {
                    ...state.runMachineWizardData.newCustomerError,
                    ...action.payload
                }
            }
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.CREATE_CUSTOMER_INITIATED)]: (state, action) => { 
        return {
            ...state,
            runMachineWizardData: {
                ...state.runMachineWizardData,
                createCustomerCallInProgress: true,
            }
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.CREATE_CUSTOMER_SUCCESS)]: (state, action) => { 
        let newCust = action.payload.newCust;
        return {
            ...state,
            runMachineWizardStep: 2,
            runMachineWizardData: {
                ...state.runMachineWizardData,
                customer: { value: newCust.id, label: `${newCust.fullName} \xa0\xa0\xa0\xa0 ${newCust.phoneNumber}` },
                createCustomerCallInProgress: initialState.runMachineWizardData.createCustomerCallInProgress,
                createCustomerFullPageError: initialState.runMachineWizardData.createCustomerFullPageError,
                newCustomerError: initialState.runMachineWizardData.newCustomerError,
                newCustomer: initialState.runMachineWizardData.newCustomer,
            }
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.CREATE_CUSTOMER_FAILED)]: (state, action) => { 
        return {
            ...state,
            runMachineWizardData: {
                ...state.runMachineWizardData,
                createCustomerCallInProgress: initialState.runMachineWizardData.createCustomerCallInProgress,
                createCustomerFullPageError: action.payload.error,
            }
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_RUN_REQUEST_INITIATED)]: (state, action) => { 
        return {
            ...state,
            runMachineStatus: {
                ...state.runMachineStatus,
                [action.payload.machineId]: "RUN_REQUEST_IN_PROGRESS",
            }
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_RUN_REQUEST_SUCCESS)]: (state, action) => { 
        return {
            ...state,
            runMachineStatus: {
                ...state.runMachineStatus,
                [action.payload.machineId]: "RUNNING",
            },
            runMachineWizardData: {...initialState.runMachineWizardData},
            runMachineWizardStep: initialState.runMachineWizardStep,
            showRunMachineWizard: initialState.showRunMachineWizard,
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_RUN_REQUEST_FAILED)]: (state, action) => { 
        return {
            ...state,
            runMachineStatus: {
                ...state.runMachineStatus,
                [action.payload.machineId]: "RUN_FAILED",
            },
            runMachineErrorMessage: action.payload.error
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_STATUS_UPDATED)]: (state, action) => { 
        let payload = action.payload;
        let machines = state.machineList.slice();
        let indexOfMachineToUpdate = machines.findIndex( (machine) => machine.id === payload.machineId);

        if(indexOfMachineToUpdate !== -1){
            let machineToUpdate = {...machines[indexOfMachineToUpdate]}
            machineToUpdate.status = payload.status;
            
            let selectedItem = state.selectedItem;
            if(state.selectedItemType === 'machine' && state.selectedItem.id === machineToUpdate.id){
                selectedItem = {...machineToUpdate};
            }

            machines[indexOfMachineToUpdate] = machineToUpdate;
            return {
                ...state,
                machineList: machines,
                selectedItem,
            }
        }
        else{
            return state;
        }
    },

    [boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_RUNNING_STATUS_UPDATED)]: (state, action) => { 
        let payload = action.payload;
        let machines = state.machineList.slice();
        let indexOfMachineToUpdate = machines.findIndex( (machine) => machine.id === payload.machineId);

        
        if(indexOfMachineToUpdate !== -1){
            let machineToUpdate = {...machines[indexOfMachineToUpdate]}
            machineToUpdate.runningStatus = payload.runningStatus;

            let selectedItem = state.selectedItem;
            if(state.selectedItemType === 'machine' && state.selectedItem.id === machineToUpdate.id){
                selectedItem = {...machineToUpdate};
            }

            machines[indexOfMachineToUpdate] = machineToUpdate;


            return {
                ...state,
                machineList: machines,
                selectedItem,
            }
        }
        else{
            return state;
        }
    },


}

export default createReducer(initialState, handlers, ["BUSINESS_OWNER_MACHINES"]);