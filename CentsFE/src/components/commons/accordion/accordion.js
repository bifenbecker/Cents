import React from 'react'
import Expandable from '../expandable/expandable'
import PropTypes from 'prop-types'
import './accordion.css'


/**
 * This is a simple Accordion component
 * Depends on Expandable
 *
 * @class Accordion
 * @extends {React.Component}
 * @author [Vinod Krishna Vellampalli](https://github.com/vinodkv2511)
 * 
 */
class Accordion extends React.Component{

    constructor(props){
        super(props)
        let collapsedArray = new Array(props.data.length).fill(true);
        if(props.defaultOpenIndex != null && props.defaultOpenIndex < props.data.length){
            collapsedArray[props.defaultOpenIndex] = false
        }
        this.state = {
            collapsed: collapsedArray
        }

        this.togHandler = this.togHandler.bind(this)
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.data.length !== prevProps.data.length){
            this.setState({
                collapsed: new Array(this.props.data.length).fill(true)
            })
        }
    }

    togHandler(index, onExpand, onCollapse){
        let newCollapsedArray;
        if(this.props.allowMultiple){
            newCollapsedArray = this.state.collapsed.slice()
        }
        else{
            newCollapsedArray = new Array(this.props.data.length).fill(true)
        }

        newCollapsedArray[index] = !this.state.collapsed[index]

        if(onExpand && !newCollapsedArray[index]){
            onExpand();
        }

        if(onCollapse && newCollapsedArray[index]){
            onCollapse();
        }

        this.setState({
            collapsed: newCollapsedArray
        })
    }


    /**
     * This function generates list of Expandables based on the data
     *
     * @param {*} data
     * @returns Array of Expandable elements
     * @memberof Accordion
     */
    getExpandables(data){
        return data.map( (dataObj, index) => {
            return <Expandable 
            key={index}
            header={dataObj.header}
            body={dataObj.body} 
            toggleHandler={()=> this.togHandler(index, dataObj.onExpand, dataObj.onCollapse)} 
            collapsed={this.state.collapsed[index]}
             />
        })
    }

    render(){
        return (
            <div className="wal-acc-container" style={this.props.style}>
                {this.getExpandables(this.props.data)}
            </div>
            ) 
    }
}

Accordion.propTypes = {
    data : PropTypes.arrayOf(PropTypes.shape({
        header: PropTypes.element.isRequired,
        body: PropTypes.element.isRequired,
        onExpand: PropTypes.func,
        onCollapse: PropTypes.func
    })).isRequired,
    defaultOpenIndex: PropTypes.number,
    allowMultiple: PropTypes.bool
}

export default Accordion;