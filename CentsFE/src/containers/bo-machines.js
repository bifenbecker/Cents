import { connect } from "react-redux";
import actionTypes from "../actionTypes";
import { createNamespacer } from "../utils/reducers";
import Machines from "../components/business-owner/machines/machines";
import * as machinesApi from '../api/business-owner/machines';
import { fetchCustomers, createCustomer } from '../api/business-owner/customers';
import _ from 'lodash';
import * as yup from 'yup';
import { run_machine_wash_type } from "../constants";
import getSocket, { socketListenerEvents as listenerEvents } from '../socket/socketClient';


const boMachinesNameSpacer = createNamespacer("BUSINESS_OWNER_MACHINES");

const customerValidationSchema = yup.object().shape({
    firstName: yup.string().required("First Name is a required field"),
    lastName: yup.string().required("Last Name is a required field"),
    email: yup.string().email("Invalid email").required("Email is required field"),
    phoneNumber: yup.string().required("Phone is a required field").max(16, "Invalid phone number"),
});

const requiredSocketListenerEvents= [
    listenerEvents.MACHINE_STATUS_UPDATED,
    listenerEvents.MACHINE_RUNNING_STATUS_UPDATED,
];

// handlers for socket messages
const commonSocketHandler= (event, payload, dispatch) => {
    console.log("Event -> ", event);
    console.log("Payload -> ", payload);
    switch(event){
        case listenerEvents.MACHINE_STATUS_UPDATED:
            dispatch({
                type :boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_STATUS_UPDATED),
                payload,
            })
            break;
        case listenerEvents.MACHINE_RUNNING_STATUS_UPDATED:
            dispatch({
                type :boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_RUNNING_STATUS_UPDATED),
                payload,
            })
            break;
        default: 
            console.warn("Common socket handler is attached to an event which is not handled by it. You might have missed adding a case. Please check your code again");

    }

}


const mapStateToProps = state => ({
    machines: state.businessOwner.machines,
    dashboard: state.businessOwner.dashboard
})

const mapDispatchToProps = dispatch => ({
    getDeviceList: async (locationIds)=>{

        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_WIZARD_DATA)
        })

        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_DEVICE_CALL_PROGRESS),
            payload: true
        })

        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.REFRESH_DATA),
            payload: false
        })
        
        let params = { stores: locationIds}
        try{
            let resp = await machinesApi.getDevices(params)

            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_DEVICE_LIST),
                payload: resp.data.devices
            })
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_DEVICES_ERROR),
                payload: ""
            })
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_DEVICE_CALL_PROGRESS),
                payload: false
            })
        }
        catch(error){
            // Dispatch set error
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_DEVICES_ERROR),
                payload: error.message
            })
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_DEVICE_CALL_PROGRESS),
                payload: false
            })
        }
        
    },

    getMachineList: async (locationIds)=>{
        
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_WIZARD_DATA)
        })
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_CALL_PROGRESS),
            payload: true
        })

        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.REFRESH_DATA),
            payload: false
        })

        try{
            let resp = await machinesApi.getMachines({stores: locationIds});

            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_LIST),
                payload: resp.data.machines
            })

            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_LIST_ERROR),
                payload: ""
            })
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_CALL_PROGRESS),
                payload: false
            })

        }
        catch(error){
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_LIST_ERROR),
                payload: error.message
            })
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_CALL_PROGRESS),
                payload: false
            })
        }
    },

    deviceClickHandler: (device) => {
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SELECTED_ITEM),
            payload: device
        })
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SELECTED_ITEM_TYPE),
            payload: "device"
        })
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_WIZARD_DATA)
        })
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_RUN_WIZARD)
        })
    },

    machineClickHandler: (machine) => {
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SELECTED_ITEM),
            payload: machine
        })
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SELECTED_ITEM_TYPE),
            payload: "machine"
        })

        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_WIZARD_DATA)
        })
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_RUN_WIZARD)
        })
    },

    updateWizard: (nextStep, field, value) => {
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.UPDATE_WIZARD),
            payload: {
                nextStep,
                field,
                value
            }
        })
    },

    fetchMachineModels: async (machineType)=>{
        try{
            let resp = await machinesApi.getMachineModels({type: machineType})

            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_MODEL_LIST),
                payload: {
                    type: machineType,
                    list: _.get(resp, "data.machineModels", [])
                }
            })
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_MODEL_LIST_ERROR),
                payload: ""
            })

        }catch(error){
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MACHINE_MODEL_LIST_ERROR),
                payload: error.message
            })
        }


        
        
    },

    fetchLoadTypes: async (modelId) => {
        try{
            let resp = await machinesApi.getModelLoadTypes({id: modelId});
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MODEL_LOAD_TYPES),
                payload: {
                    modelId,
                    list: resp.data.loadTypes
                }
            })
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MODEL_LOAD_TYPES_ERROR),
                payload: ""
            })

        }catch(error){
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_MODEL_LOAD_TYPES_ERROR),
                payload: error.message
            })
        }

        
    },

    resetWizard(){
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_WIZARD_DATA)
        })
    },

    resetMachines(){
        // RESET THE ENTIRE MAHCINE STATE;
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_MACHINES_STATE)
        })

    },

    submitPairing: async (payload) => {

        try{
            let resp = await machinesApi.submitPairing(payload);
            
            // Setting new machine as selected item
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SELECTED_ITEM),
                payload: _.get(resp, "data.machine")
            })

            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SELECTED_ITEM_TYPE),
                payload: "machine"
            })
            

            // Refreshing the lists
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.REFRESH_DATA),
                payload: true
            })

            // Resetting the error if any
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_PAIRING_ERROR),
                payload: ""
            })
        }catch(error){
            if(_.get(error, "response.data.error")){
                dispatch({
                    type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_PAIRING_ERROR),
                    payload: _.get(error, "response.data.error")
                })
            }
            else{
                dispatch({
                    type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_PAIRING_ERROR),
                    payload: error.message
                })
            }
            
        }

    },

    autoSelectItem(){
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.AUTO_SELECT_ITEM)
        })
    },

    toggleMachineMenu(evt){
        if( evt.target.classList.contains("machine-context-menu-item") || evt.target.classList.contains("machine-context-menu-background-click-area") || evt.target.classList.contains("machine-menu-icon") || evt.target.classList.contains("machine-menu-icon-container")){
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.TOGGLE_MACHINE_MENU)
            })
        }
        else{
            evt.preventDefault();
        }
        
    },

    updateMachineStatus(message){
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.UPDATE_MACHINE_STATUS),
            payload: message
        })
    },

    updateDeviceStatus(message){
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.UPDATE_DEVICE_STATUS),
            payload: message
        })
    },

    setRunMachineStatus(machineId, status){
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_RUN_MACHINE_STATUS),
            payload: {
                machineId,
                status
            }
        })
    },

    handleRunMachineOption(){
        // Set wizard active to true
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_SHOW_RUN_WIZARD),
            payload: true,
        })
        // Set initial wizard data
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_RUN_WIZARD_STEP),
            payload: 1,
        })
    },

    handleRunMachineCommand: async (data) => {
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_RUN_REQUEST_INITIATED),
            payload: {
                machineId: data.machineId
            }
        });

        let payload = {
            machineId: data.machineId,
            washType: data.washType,
            customerId: _.get(data,"customer.value", null),
            technicianName: data.technicianName,
            reason: data.reason,
            notes: data.notes,
        }

        try{
            await machinesApi.startMachine(payload);
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_RUN_REQUEST_SUCCESS),
                payload: {
                    machineId: data.machineId
                }
            })
        }
        catch(e){
            // Dispatch Run Request Failed
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.MACHINE_RUN_REQUEST_FAILED),
                payload: {
                    machineId: data.machineId
                }
            })
        }
    },

    handleRunMachineDataChange(field, value){

        // Validation for create customer
        if(field === 'newCustomer'){
            try{
                customerValidationSchema.validateSyncAt(Object.keys(value)[0], value);
                // Reset Validation Error for current field
                dispatch({
                    type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_NEW_CUSTOMER_ERROR),
                    payload: {
                        [Object.keys(value)[0]]: ''
                    }
                })
            }
            catch(e){
                // Dispatch Validation Error
                dispatch({
                    type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_NEW_CUSTOMER_ERROR),
                    payload: {
                        [Object.keys(value)[0]]: e.message,
                    }
                })
            }
        }

        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_RUN_WIZARD_DATA_FIELD),
            payload: {
                field,
                value 
            }
        })
    },

    updateRunMachineWizardStep: async (step, washType) => {
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_RUN_WIZARD_STEP),
            payload: step
        })

        if(step === 2 && washType === run_machine_wash_type.CUSTOMER_SERVICE){
            // Make API call && set default search list 
            let resp = await fetchCustomers();
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_WIZ_CUSTOMER_SEARCH_LIST),
                payload: _.get(resp, "data.detail")
            })
        }
    },

    resetRunWizard(){
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.RESET_RUN_WIZARD)
        })
    },

    isNewCustomerValid: (data) => {
        try{
            customerValidationSchema.validateSync(data);
            return true;
        }
        catch(e){
            return false;
        }
    },

    createCustomer: async (data) => {
        // Set loader
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.CREATE_CUSTOMER_INITIATED)
        })
        try{
            let resp = await createCustomer(data);

            let newCust = _.get(resp, "data.details");
            
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.CREATE_CUSTOMER_SUCCESS),
                payload: {
                    newCust,
                }
            })
        }
        catch(e){
            // Set create page error
            dispatch({
                type: boMachinesNameSpacer(actionTypes.businessOwner.machines.CREATE_CUSTOMER_FAILED),
                payload: {
                    error: _.get( e, "response.data.error", e.message ),
                }
            })
        }
        
        dispatch({
            type: boMachinesNameSpacer(actionTypes.businessOwner.machines.SET_CREATE_CUSTOMER_IN_PROGRESS),
            payload: false
        }) 
        
    },

    attachSocketHandlers: () => {
        let socket = getSocket();
        for( let event of requiredSocketListenerEvents){
            socket.onCustomEvent(event, (payload) => commonSocketHandler(event, payload, dispatch));
        }
    },

    removeSocketHandlers: () => {
        let socket = getSocket();

        for( let event of requiredSocketListenerEvents){
            socket.off(event, commonSocketHandler);
        }
    }

})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Machines)
