import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import TextField from '../../../../commons/textField/textField';
import BlockingLoader from '../../../../commons/blocking-loader/blocking-loader';
import person from '../../../../../assets/images/person.svg';
import location from '../../../../../assets/images/location.svg';
import email from '../../../../../assets/images/email.svg';
import phone from '../../../../../assets/images/phone.svg';
class Details extends Component{

    constructor(props){
        super(props);

        this.state={
            checked: false,
        }
    }
    
    componentDidMount(){
        this.props.fetchAccountDetails()
    }

    componentDidUpdate(prevProps) {
        this._auto_focus_region_or_dist_field(prevProps);
    }

    _auto_focus_region_or_dist_field(prevProps){
        const prevDistCount = _.get(prevProps, "accountSettings.modalRegion.districts.length", 0);
        const currentDistCount = _.get(this.props, "accountSettings.modalRegion.districts.length", 0);

        if(
            (this.props.accountSettings.showRegionModal && prevProps.accountSettings.showRegionModal === false) // Regions modal is made visible
            ||
            prevDistCount !== currentDistCount // A new dist is added
        )
        { 
            const regionInput = document.querySelector('.region-field > input');
            const districtFields = document.querySelectorAll('.district-field > input');
            if(districtFields.length === 0){
                // Focus Regions Field
                regionInput && regionInput.focus();
            }
            else{
                // Focus district field
                districtFields[districtFields.length-1].focus();
            }
        }        
    }

    _renderError(){
        return this.props.accountSettings.errorMessage
    }

    _render_name_form_section = (accountDetails) => {
        return (
            <div className="form-section">
                <img alt="icon" src={person}>
                </img>
                <div className="form-fields-container">
                    <TextField 
                        error = {this.props.accountSettings.errorFields.fullName}
                        label = "Name"
                        className="account-settings-input"
                        value={accountDetails.fullName}
                        onChange={(evt)=> this.props.formChangeHandler("fullName", evt)}
                        isInline= {true}
                    />
                    <TextField 
                        error = {this.props.accountSettings.errorFields.companyName}
                        label = "Company Name"
                        className="account-settings-input"
                        value={accountDetails.companyName}
                        onChange={(evt)=> this.props.formChangeHandler("companyName", evt)}
                        isInline= {true}
                    />
                </div>
            </div>
        )
    }

    _render_address_form_section = (accountDetails) => {
        return(
            <div className="form-section">
                <img alt="icon" src={location}></img>
                <div className="form-fields-container">
                    <TextField 
                        error = {this.props.accountSettings.errorFields.address}
                        label = "Address"
                        className="account-settings-input"
                        value={accountDetails.address}
                        onChange={(evt)=> this.props.formChangeHandler("address", evt)}
                        isInline= {true}
                    />
                    <TextField 
                        error = {this.props.accountSettings.errorFields.city}
                        label = "City"
                        className="account-settings-input"
                        value={accountDetails.city}
                        onChange={(evt)=> this.props.formChangeHandler("city", evt)}
                        isInline= {true}
                    />
                    <TextField 
                        error = {this.props.accountSettings.errorFields.state}
                        label = "State"
                        className="account-settings-input"
                        value={accountDetails.state}
                        onChange={(evt)=> this.props.formChangeHandler("state", evt)}
                        isInline= {true}
                    />
                    <TextField 
                        error = {this.props.accountSettings.errorFields.zipCode}
                        label = "Zip"
                        className="account-settings-input"
                        value={accountDetails.zipCode}
                        onChange={(evt)=> this.props.formChangeHandler("zipCode", evt)}
                        isInline= {true}
                    />
                </div>

            </div>
        )
    }

    _render_phone_and_email_form_sections = (accountDetails) => {
        return (
            <Fragment>
                <div className="form-section">
                    <img alt="icon" src={phone}></img>
                    <div className="form-fields-container">
                        <TextField 
                            error = {this.props.accountSettings.errorFields.phone}
                            label = "Phone"
                            className="account-settings-input"
                            value={accountDetails.phone}
                            onChange={(evt)=> this.props.formChangeHandler("phone", evt)}
                            isInline= {true}
                        />    
                    </div>
                </div>

                <div className="form-section">
                    <img alt="icon" src={email}></img>
                    <div className="form-fields-container">
                        <TextField 
                            label = "Email"
                            className="account-settings-input"
                            value={accountDetails.email}
                            disabled
                            onChange={(evt)=> this.props.formChangeHandler("email", evt)}
                            isInline= {true}
                        /> 
                    </div>
                </div>
            </Fragment>
        )
    }

    render(){
        const accountDetails = this.props.accountSettings.accountDetails;
        if(this.props.accountSettings.fullPageError){
            return this._renderError()
        }
        else{
            return (
                <Fragment>
                    {
                        this.props.accountSettings.updateInProgress 
                        ?
                            <BlockingLoader />
                        : ""
                    }
                
                    <div className="account-settings-container">
                        
                        {this._render_name_form_section(accountDetails)}
        
                        {this._render_address_form_section(accountDetails)}

                        {this._render_phone_and_email_form_sections(accountDetails)}

                        <p className={"error-message"}>{this.props.accountSettings.errorMessage}</p>
                        
                    </div>
                
                    
                </Fragment>
            )
        }
    }
}

export default Details;