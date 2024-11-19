import { connect } from "react-redux";
import Regions from '../components/business-owner/global-settings/account/regions/regions';
import actionTypes from "../actionTypes";
import { createNamespacer } from "../utils/reducers";
import * as accountApi from "../api/business-owner/account"
import _ from "lodash";
import * as yup from 'yup';

const BoGSAccountNamespacer = createNamespacer("BUSINESS_OWNER_GS_ACCOUNT_SETTINGS");
const accountSettingsAT = actionTypes.businessOwner.globalSettings.accountSettings;

const as_schema = yup.object().shape({
    fullName: yup.string().required("Name is a required field"),
    companyName: yup.string().required("Company Name is a required field"),
    address: yup.string().required("Address is a required field"),
    city: yup.string().required("City is a required field"),
    state: yup.string().required("State is a required field"),
    email: yup.string().email("Email is a required field"),
    phone: yup.string().required("Phone is a required field").max(16, "Invalid phone number"),
    zipCode: yup.string().matches(/^[0-9]{5}(?:-[0-9]{4})?$/, "Invalid zip code").required("Zip code is a required field"),
    needsRegions: yup.boolean().required("Needs region is a required field"),
  });
const validateFormData = (formObject) => {
      return as_schema.validate(formObject, {abortEarly: false})
}

const mapAccountSettingsResponse = (response) => {

    let accountSettingsData = _.get(response, "data.accountDetails", {})

    const responseMapping = {
        fullName: "fullName",
        companyName: "companyName",
        address: "address",
        state: "state",
        city: "city",
        zipCode: "zipCode",
        phone: "phone",
        email: "email",
        needsRegions: "needsRegions",
        regions: "regions"
    }

    let formattedResp = {};

    Object.keys(responseMapping).forEach( key => {
        let rawData = _.get(accountSettingsData, responseMapping[key], "");
        formattedResp[key] = _.isNull(rawData) ? "" : rawData
    })

    return formattedResp;  
}

const mapStateToProps = state => ({
    accountSettings: state.businessOwner.globalSettings.accountSettings
});


const fetchAccountDetails = async (dispatch) => {
    try{
        let res = await accountApi.fetchAccountDetails();
        
        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS),
            payload : mapAccountSettingsResponse(res) 
        })

        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.RESET_ACCOUNT_DETAILS_ERROR),
        })
        
    }
    catch(error){
        // Set error
        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS_ERROR),
            payload: {
                errorMessage: `Something went wrong!
                ${error.message}`,
                fullPageError: true
            }
        })
    }
}

const validateAndPutAccountDetails = _.debounce((field, value, dispatch)=> {
    try{
        as_schema.validateSyncAt(field, {[field]: value});
    }catch(e){
        // Dispatch error and return
        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS_FIELD_ERROR),
            payload: {
                field,
                error: e.message
            }
        })
        return
    }

    // Validated - So make api call
    accountApi.updateAccountDetails({field, value})
        .then((res)=>{
            // Clear api error
            dispatch({
                type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS_FIELD_ERROR),
                payload: {
                    field,
                    error: ''
                }
            })
        })
        .catch((e)=> {
            //Dispatch error
            dispatch({
                type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS_FIELD_ERROR),
                payload: {
                    field,
                    error: e.message
                }
            })
        })

}, 200)

const mapDispatchToProps = dispatch => ({
    fetchAccountDetails: async () => {
        await fetchAccountDetails(dispatch);
    },

    updateAccountDetails: async (accountDetails) => {
        // Call the validation function
        try {
            await validateFormData(accountDetails);
    
            try {
                dispatch({
                    type: BoGSAccountNamespacer(accountSettingsAT.UPDATE_CALL_IN_PROGRESS),
                    payload: true
                })
                await accountApi.updateAccountDetails(accountDetails);
                await fetchAccountDetails(dispatch);
        
                dispatch({
                    type: BoGSAccountNamespacer(accountSettingsAT.RESET_ACCOUNT_DETAILS_ERROR)
                })
                dispatch({
                    type: BoGSAccountNamespacer(accountSettingsAT.UPDATE_CALL_IN_PROGRESS),
                    payload: false
                })
            } catch (error) {
                dispatch({
                    type: BoGSAccountNamespacer(accountSettingsAT.UPDATE_CALL_IN_PROGRESS),
                    payload: false
                })
                dispatch({
                    type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS_ERROR),
                    payload:{
                        errorMessage: `An unexpected error occured: ${
                            _.get(error,"response.data.error", "") }.`
                    }
                })
            }
        } catch (error) {
            //Setting the error fields
            let errorFields = {}
            error.inner.forEach(error => {
                errorFields[error.path] = true
            });
    
            let errorMessage = error.message + ". Please fix the error and try again";
            if(Object.keys(errorFields).length > 1){
                errorMessage = "Multiple errors occured. Please fix the errors and try again";
            }
    
            dispatch({
                type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS_ERROR),
                payload:{
                    errorMessage,
                    errorFields
                }
            })
        }
    }, 

    formChangeHandler: (field, evt) => {
        let value;
        if(field === "needsRegions"){
            value = evt;
        }
        else{
            value = evt.target.value
        }
        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.UPDATE_ACCOUNT_DETAILS),
            payload: {
                field,
                value: value
            }
        })

        validateAndPutAccountDetails(field, value, dispatch);
    },

    handleRegionClick: (regionId) => {
        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.SET_SHOW_REGION_MODAL),
            payload: true
        })

        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.SET_MODAL_REGION),
            payload: regionId
        })
    },

    handlePopUpClose: () => {
        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.SET_SHOW_REGION_MODAL),
            payload: false
        })

        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.SET_REGION_SAVE_ERROR),
            payload: ""
        })

        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.SET_MODAL_REGION),
            payload: -1
        })
    },

    addNewDistrict: () => {
        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.ADD_NEW_DISTRICT_TO_MODAL_REGION),
        })
    },

    modalRegionChangeHandler: (field, index, value) => {
        dispatch({
            type: BoGSAccountNamespacer(accountSettingsAT.SET_REGION_MODAL_TEXT_FIELD_VALUE),
            payload: {
                field,
                index,
                value
            }
        })
    },

    saveRegionChanges: async (region) => {
        try{
            dispatch({
                type: BoGSAccountNamespacer(accountSettingsAT.SET_REGION_SAVE_IN_PROGRESS),
                payload: true
            })
            await accountApi.createOrUpdateRegion(region);
            // Update is successful
            // So fetching updated account settings data
            
            try{
                let res = await accountApi.fetchAccountDetails();
                
                dispatch({
                    type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS),
                    payload : mapAccountSettingsResponse(res) 
                })

                dispatch({
                    type: BoGSAccountNamespacer(accountSettingsAT.RESET_ACCOUNT_DETAILS_ERROR),
                })
                
            }
            catch(error){
                // Set error
                dispatch({
                    type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS_ERROR),
                    payload: {
                        errorMessage: `Something went wrong!
                        ${error.message}`,
                        fullPageError: true
                    }
                })
            }

            dispatch({
                type: BoGSAccountNamespacer(accountSettingsAT.SET_SHOW_REGION_MODAL),
                payload: false
            })

            dispatch({
                type: BoGSAccountNamespacer(accountSettingsAT.SET_REGION_SAVE_ERROR),
                payload: ""
            })
            
            dispatch({
                type: BoGSAccountNamespacer(accountSettingsAT.SET_REGION_SAVE_IN_PROGRESS),
                payload: false
            })
        }
        catch (e){
            dispatch({
                type: BoGSAccountNamespacer(accountSettingsAT.SET_REGION_SAVE_ERROR),
                payload: _.get(e,"response.data.error", "Something went wrong!")
            })
            dispatch({
                type: BoGSAccountNamespacer(accountSettingsAT.SET_REGION_SAVE_IN_PROGRESS),
                payload: false
            })
        }
    }



});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Regions);


