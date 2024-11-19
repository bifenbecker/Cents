import React from 'react';
import PropTypes from 'prop-types';
import selectedRadio from '../../../assets/images/selected_radio.svg';
import unSelectedRadio from '../../../assets/images/unselected_radio.svg';

function WizardRadioSelector(props){
    return(
        <div 
            onClick={props.onClick}
            className={ `wizard-radio-selector ${props.className || ''} ${props.isActive ? "active" : ""}` }
        >
            <img src={ props.isActive ? props.activeImage : props.inactiveImage } alt="icon"></img>
            {props.label}
            <img alt="" className="checkbox-icon" src={ props.isActive ? selectedRadio : unSelectedRadio }/>
        </div>
    )
}

WizardRadioSelector.propTypes = {
    activeImage: PropTypes.string.isRequired,
    inactiveImage: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
}

export default WizardRadioSelector;