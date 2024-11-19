import React from 'react'
import bubbles from '../../../assets/images/bubbles.svg'

const BoSidebar = (props) => {
    return(
        <div className="bo-sidebar-container">
            {props.children}
            <img className="bottom-bubbles" src={bubbles} alt=""/>
        </div>
    )
}

export default BoSidebar;