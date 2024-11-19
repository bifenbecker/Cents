import React from 'react';
import PropTypes from 'prop-types';



function ToggleSwitch(props){

    const toggle = () => {
        if(props.onChange && !props.disabled)
        {
            props.onChange(!props.checked);
        }
    }

    return(
        <div className={`toggle-switch ${props.checked ? 'active' : ''} ${props.disabled ? 'disabled' : ''} ${props.className}`} onClick={toggle}>
            <div className="track">
                <div className="slider"></div>
            </div>
        </div>
    )
}

ToggleSwitch.propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}

export default ToggleSwitch;