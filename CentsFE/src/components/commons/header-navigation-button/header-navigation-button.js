import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom'; 

const HeaderNavigationButton = ({activeImage, inactiveImage, title, isActive, linkTo}) => {
  let [isHovered, setIsHovered] = useState(false);

  if(!linkTo){
    return (
      <div className={`head-nav-button-container ${isActive && 'active'}`} onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)}>
        <img src={isActive || isHovered ? activeImage : inactiveImage} alt=""/>
        <p>{title}</p>
      </div>
    )
  }

  return(
    <Link to={linkTo} className={`head-nav-button-container ${isActive && 'active'}`} onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)}>
      <img src={isActive || isHovered ? activeImage : inactiveImage} alt=""/>
      <p>{title}</p>
    </Link>
  )
}

HeaderNavigationButton.propTypes= {
  activeImage: PropTypes.any.isRequired,
  inactiveImage: PropTypes.any.isRequired,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  linkTo: PropTypes.string,
}

export default HeaderNavigationButton;
