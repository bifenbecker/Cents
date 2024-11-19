import React from 'react';
import PropTypes from 'prop-types';

const IconInsight = (props) => {

  let {icon, value, description, className} = props;

  return(
    <div className={`icon-insight ${className || ''}`}>
        <img src={icon} alt="icon" />
        <div>
            <p>{value}</p>
            <p>{description}</p>
        </div>
    </div>
  )

}

IconInsight.propTypes = {
  icon: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
}

export default IconInsight;
