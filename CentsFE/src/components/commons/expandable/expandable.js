import React from 'react'
import PropTypes from 'prop-types'
import "./expandable.css"


/**
 * This is a simple component which has a header and an expandable body
 * Toggling of the body should be handled externally
 * 
 * @param {*} this.props
 * @author [Vinod Krishna Vellampalli](https://github.com/vinodkv2511)
 */
class Expandable extends React.Component {

    constructor(props){
        super(props)
        this.myRef = React.createRef();
        this.headRef = React.createRef();
    }

    componentDidMount(){
        this.setMaxHeight();
        this.setIconRotation();
    }

    componentDidUpdate(){
        this.setMaxHeight();
        this.setIconRotation();
    }

    setMaxHeight(){
        let bodyElem = this.myRef.current
        const paddingVertical = 40 // Need to find a way to read it from css style
        let pixelMaxHeight = bodyElem.firstElementChild.clientHeight
        bodyElem.style.maxHeight = pixelMaxHeight + paddingVertical + "px"
    }

    setIconRotation(){
        let headerElem = this.headRef.current
        if(headerElem && headerElem.getElementsByClassName("accordion-indicator-icon").length === 1){
            if(this.props.collapsed === false){
                headerElem.getElementsByClassName("accordion-indicator-icon")[0].style.transform = "rotate(180deg)";
            }
            else{
                headerElem.getElementsByClassName("accordion-indicator-icon")[0].style.transform = "rotate(0deg)";
            }
            
        }
    }

    render(){
        return (
            <div className="wal-acc-exp-container"> 
                <div ref={this.headRef} className="wal-acc-exp-header" onClick={this.props.toggleHandler}>
                    {/* { this.props.data.icon && <i className="material-icons">{this.props.data.icon}</i>}
                    <p>
                        {this.props.data.header}
                    </p> */}
                    {this.props.header}
                </div>
                <div  ref={this.myRef} className={"wal-acc-exp-body " + (this.props.collapsed === false ? "" : "collapsed" )} >
                    {this.props.body}
                    {/* <p>
                        {this.props.data.body}
                    </p> */}
                </div>
            </div>
        )
    }
}

Expandable.propTypes = {
    // data: PropTypes.shape(
    //     {
    //         icon: PropTypes.string,
    //         header: PropTypes.string.isRequired,
    //         body: PropTypes.string.isRequired
    //     }
    // ).isRequired,
    header: PropTypes.element.isRequired,
    body: PropTypes.element.isRequired,
    collapsed: PropTypes.bool,
    toggleHandler: PropTypes.func
}

export default Expandable