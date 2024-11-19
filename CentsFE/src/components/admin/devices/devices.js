import React, { Component, Fragment } from "react";
import { withRouter, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faSpinner, faFolder, faArrowCircleDown } from "@fortawesome/free-solid-svg-icons";
import UploadCSVModal from "./uploadCSVModal/uploadCSVModal";
import { formattedUserId } from "../../../utils/functions";
import machine from "../../../assets/images/machine.svg";
import Pagination from "../../commons/pagination";
import { Table } from "reactstrap";
import moment from "moment";
import cx from "classnames";
import Accordion from "../../commons/accordion/accordion";
import _ from "lodash";

class Devices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };
  }

  componentDidMount = () => {
    const { businessOwnerId } = this.props.match.params;
    this.props.setCurrentBusinessOwner(businessOwnerId);
  };

  componentWillUnmount() {
    this.props.clearDevices();
    this.props.clearDevicesError();
    this.props.clearCurrentBusinessOwnerData();
  }

  openCSVUploadModal = () => {
    this.setState({
      modal: true
    });
  };

  closeCSVUploadModal = () => {
    this.setState({
      modal: false
    });
  };

  handlePagination = (batchId, page) => {
    if(!batchId){
      console.warn('No batch id provided.')
      return
    }
    let batch = _.get(this.props, `devices.batchData.${batchId}`)
    
    if(!page){
      // Persist previously opened page in a batch
      page = batch ? batch.currentPage : 1
    }

    this.props.updateCurrentPage(this.props.match.params.businessOwnerId, batchId, page);
    // let currentPage = batch ? batch.currentPage : null ;
    // if (currentPage !== page) {
      // this.props.updateCurrentPage(batchId, page);
    // }
  };

  _renderLoader = () => {
    return (
      <div className="no-data-loader">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="no-data-loader-icon"
        />
      </div>
    );
  };

  _renderEmptyList = () => {
    return (
      <div className="no-customers-container">
        {
          //Show a different image in case of error, Using the same image as placeholder
          this.props.devices.showError ? 
          <img src={machine} alt="machine" className="no-customer-icon" /> :
          <img src={machine} alt="machine" className="no-customer-icon" />
        }
        
        { 
              this.props.devices.showError && this.props.devices.error 
              ?
                <span className="no-customer-info">
                  <pre>
                    {this.props.devices.error}
                  </pre>
                </span>
               :
                  <span className="no-customer-info">
                    No CENTS devices assigned yet.<br />Upload CSV file with device Ids
                  </span>
                
        }
        
        
      </div>
    );
  };

  _renderList = batch => {
    let deviceList = batch.devices;
    let { currentPage, totalPage } = batch;
    return (
      <React.Fragment>
        <div
          className={cx("table-devices-list-container", {
            "table-devices-list-container-with-pagination": totalPage > 1
          })}
        >
          <Table className="table-devices-list">
            <thead>
              <tr>
                <th>Device Id</th>
                <th>Assigned On</th>
              </tr>
            </thead>
            <tbody>
              {deviceList.map((device, index) => (
                <tr key={index}>
                  <td>{device.name}</td>
                  <td>{moment(device.createdAt).format("D-MMM-YYYY")}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        {totalPage > 1 ? (
          <Pagination
            currentPage={currentPage}
            totalPage={totalPage}
            handlePagination={ (page)=> this.handlePagination(batch.batchId, page)} 
          />
        ) : null}
      </React.Fragment>
    );
  };

  _getAccordionData = (batchList) => {
    
    if(!batchList){
      return
    }
    return batchList.map( batch => {
      let businessOwner = this.props.businessOwners.currentBusinessOwner.data
      return {
        header: <div className="selected-customer-details d-flex align-items-center" onClick={()=>{this.handlePagination(batch.id)}}>
        {businessOwner &&(
          <Fragment>
            <div className="devices-batch-details d-flex align-items-center justify-content-around">
              <FontAwesomeIcon className="folder-icon" icon={faFolder} />
              <p>Batch Id: <span>{batch.id}</span></p>
            </div>
          
            <div className="batch-wise-device-count">
              Devices #{batch.deviceCount !== null
                      ? batch.deviceCount
                      : 0}
            </div>
            <div className="batch-assigned-on">
              Assigned on: {moment(batch.createdAt).format("D-MMM-YYYY")}
            </div>
            <FontAwesomeIcon icon={faArrowCircleDown} className="arrow-circle-down-icon accordion-indicator-icon"/>
          </Fragment>
          )}
        </div>,
        body: <div className="devices-list">{this._renderUI(batch.id)}</div>
      }
    })
  }

  _renderUI = (batchId) => {
    let deviceList = null;
    const { devices } = this.props;
    deviceList = devices.batchData[batchId] ? devices.batchData[batchId].devices : null;

    if (deviceList !== null && _.get(devices, `batchData.${batchId}.showError`)) {
      return this._renderEmptyList();
    } else if (deviceList && deviceList.length !== 0) {
      return this._renderList(devices.batchData[batchId]);
    } else {
      return this._renderLoader();
    }
  };

  _renderBatchesUI = () => {
    let batchList = this.props.devices.batchList;
    if (batchList !== null && this.props.devices.showError) {
      return this._renderEmptyList();
    } else if (batchList && batchList.length !== 0) {
      return <Accordion data={this._getAccordionData(batchList)} /> ;
    } else {
      return this._renderLoader();
    }
  }

  render() {
    const { data } = this.props.businessOwners.currentBusinessOwner;
    let businessOwner = {};
    businessOwner = data;

    return (
      <div className="devices-container customers-container">
        <div className="title-container">
          <ul className="breadcrumbs list-unstyled">
            <li>
              <Link to="/"><span>Customers</span></Link>
            </li>
            <span>&gt;</span>
            {businessOwner && (
              <li className="disabled-breadcrumb-item">
                {businessOwner.firstname} {businessOwner.lastname} (#
                {formattedUserId(businessOwner.userId)})
              </li>
            )}
          </ul>
          {businessOwner && (
            <Fragment>
            <div className="device-customer-details-container d-flex align-items-end">
              <div className="customer-details auto-width d-flex flex-column">
                <span className="customer-id">#{formattedUserId(businessOwner.userId)}</span>
                <h4 className="customer-name">{businessOwner.firstname} {businessOwner.lastname}</h4>
                <span className="customer-company">{businessOwner.name}</span>
              </div>
              <div className="batch-device-count counts-with-left-seperator d-flex flex-column">
                <span> Batches Assigned: {businessOwner.batchCount !== null
                      ? businessOwner.batchCount
                      : 0} 
                </span>
                <span> Total Devices: {businessOwner.deviceCount !== null
                      ? businessOwner.deviceCount
                      : 0} 
                </span>
              </div>
              <div className="actions-device-count d-flex align-items-center justify-content-end">
                <button
                  className="btn-theme btn-upload-device d-flex align-items-center"
                  onClick={this.openCSVUploadModal}
                >
                  <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                  Upload Device Ids
                </button>
              </div>
            </div>
            </Fragment>
          )}
        </div>
        <div className="devices-list-container">
          
          {this._renderBatchesUI(this.props.devices.batchList)}
          
        </div>
        <UploadCSVModal
          isOpen={this.state.modal}
          businessId={this.props.match.params.businessOwnerId}
          openCSVUploadModal={this.openCSVUploadModal}
          closeCSVUploadModal={this.closeCSVUploadModal}
          clearDevicesError={this.props.clearDevicesError}
          setCurrentBusinessOwner={this.props.setCurrentBusinessOwner}
          setUploadProgress={this.props.setUploadProgress}
          isUploadInProgress={this.props.devices.isUploadInProgress}
        />
      </div>
    );
  }
}

export default withRouter(Devices);
