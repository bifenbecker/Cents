import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const SidebarItem = (props) => {
    const isActive = props.linkToPath === props.currentPath;
    return (
        <Link to={props.linkToPath}>
            <div className={`sidebar-tab-container ${isActive? 'active' : ''}`}>
                <img src={ isActive ? props.activeImg: props.inactiveImg } alt="machines" className="icon"></img>
                <p>{props.label}</p>
            </div>
        </Link>
    )
}

SidebarItem.propTypes = {
    linkToPath : PropTypes.string.isRequired,
    currentPath: PropTypes.string.isRequired,
    label : PropTypes.string.isRequired,
    activeImg : PropTypes.string.isRequired,
    inactiveImg : PropTypes.string.isRequired
}

export default SidebarItem;