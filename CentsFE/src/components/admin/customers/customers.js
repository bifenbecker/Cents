import React, { Component, Fragment } from "react";
import { withRouter, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formattedUserId } from "../../../utils/functions";
import Pagination from "../../commons/pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import TextField from '../../commons/textField/textField';
import * as yup from 'yup';
import {
  faStreetView,
  faSpinner,
  faUserPlus,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import { Formik } from "formik";

class Customers extends Component {
  componentDidMount() {
    const { currentPage } = this.props.businessOwners;
    this.props.fetchBusinessOwners(currentPage);
  }

  componentDidUpdate() {
    if(this.props.businessOwners.refreshCustomerList){
      this.props.fetchBusinessOwners(this.props.businessOwners.currentPage);
    }
  }

  handlePagination = page => {
    const { currentPage } = this.props.businessOwners;
    if (currentPage !== page) {
      this.props.updateCurrentPage(page);
      this.props.fetchBusinessOwners(page);
    }
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

  _renderEmptyList = businessOwners => {
    return (
      <div className="no-customers-container">
        <FontAwesomeIcon icon={faStreetView} className="no-customer-icon" />
        {businessOwners.showError && (
          <span className="no-customer-info">{businessOwners.error}</span>
        )}
      </div>
    );
  };

  _renderList = data => {
    const { currentPage, totalPage } = this.props.businessOwners;
    return (
      <div
        className={cx("customers-list", {
          "customers-list-with-pagination": totalPage > 1
        })}
      >
        <ul className="list-unstyled m-0">
          {data.map((item, index) => (
            <Link
              key={`customer-${index}`} 
              to={`/device/${item.businessId}`}
            >
              <li
                className="d-flex align-items-center"
              >
                <div className="customer-details d-flex flex-column">
                  <span className="customer-id">
                    #{formattedUserId(item.userId)}
                  </span>
                  <h4 className="customer-name">
                    {item.firstname} {item.lastname}
                  </h4>
                  <span className="customer-company">{item.name}</span>
                </div>
                <div className="batch-device-count d-flex flex-column justify-content-start">
                  <span>Batches Assigned : {item.batchCount}</span>
                  <span>Devices Assigned : {item.deviceCount}</span>
                </div>
                <div className="actions-device-count d-flex align-items-center justify-content-end">
                  <button className="btn-theme btn-upload-device d-flex align-items-center">
                    View Details
                  </button>
                </div>
              </li>
            </Link>
          ))}
        </ul>
        {totalPage > 1 ? (
          <Pagination
            currentPage={currentPage}
            totalPage={totalPage}
            handlePagination={this.handlePagination}
          />
        ) : null}
      </div>
    );
  };

  _renderCreateCustomerModal = () => {
    return (
      <Modal
        isOpen={this.props.businessOwners.showCreateModal}
        centered={true}
        className={"create-customer-modal"}
      >
        <ModalHeader close={<FontAwesomeIcon icon={faTimes} onClick={this.props.cancelCreateCustomerModal}/>}>
          Add New Customer
        </ModalHeader>
        
          <Formik
            initialValues = {{
              firstName: "",
              lastName: "",
              email: "",
              companyName: ""
            }}

            onSubmit = {(values, actions)=>{
              this.props.submitNewCustomer(values);
              actions.setSubmitting(false);
            }}

            validationSchema={yup.object().shape({
              firstName: yup.string().required("Name is a required field"),
              lastName: yup.string().required("Company Name is a required field"),
              companyName: yup.string().required("Address is a required field"),
              email: yup.string().email("Invalid email address").required("Email is a required field")
            })}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              })=>(
                <Fragment>
                  <ModalBody>
                    <TextField 
                        error = { errors.firstName && touched.firstName }
                        name = "firstName"
                        label = "First Name"
                        className="account-settings-input"
                        value = {values.firstName}
                        onChange = {handleChange}
                        onBlur = {handleBlur}
                    />
                    <div className="error-message">{ touched.firstName && errors.firstName }</div>

                    <TextField 
                        error = { errors.lastName && touched.lastName }
                        name = "lastName"
                        label = "Last Name"
                        className="account-settings-input"
                        value = {values.lastName}
                        onChange = {handleChange}
                        onBlur = {handleBlur}
                    />
                    <div className="error-message">{ touched.lastName && errors.lastName }</div>

                    <TextField 
                        error = { errors.email && touched.email }
                        name = "email"
                        label = "Email"
                        className="account-settings-input"
                        value = {values.email}
                        onChange = {handleChange}
                        onBlur = {handleBlur}
                    />
                    <div className="error-message">{ touched.email && errors.email }</div>

                    <TextField 
                        error = { errors.companyName && touched.companyName }
                        name = "companyName"
                        label = "Company Name"
                        className="account-settings-input"
                        value = {values.companyName}
                        onChange = {handleChange}
                        onBlur = {handleBlur}
                    />
                    <div className="error-message">{ touched.companyName && errors.companyName }</div>
                    <div className="error-message">{ this.props.businessOwners.createCustomerError }</div>
                  </ModalBody>
                  <ModalFooter>
                      <button className={"outline btn-theme btn-corner-rounded"} onClick={this.props.cancelCreateCustomerModal} >Cancel</button>
                      <button 
                        disabled = {isSubmitting}
                        type="submit"
                        className={"btn-theme btn-corner-rounded"} 
                        onClick = {handleSubmit}
                      >Create Account</button>
                  </ModalFooter>
                </Fragment>
              )}
            
          </Formik>
        
        
      </Modal>
    )};

  _renderUI = () => {
    const { businessOwners } = this.props;

    if (businessOwners.value == null && businessOwners.showError) {
      return this._renderEmptyList(businessOwners);
    } else if (businessOwners.value && businessOwners.value.length !== 0) {
      return this._renderList(businessOwners.value);
    } else {
      return this._renderLoader();
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="customers-container">
          <div className="title-container customers-title-container">
            <h3 className="title-customers title-page">Customers</h3>
            <button className="btn-theme btn-corner-rounded d-flex align-items-center" onClick={this.props.showCreateCustomerModal}>
                <FontAwesomeIcon icon={faUserPlus}/>
                Add New Customer
            </button>
          </div>
          {this._renderUI()}
        </div>
        {this._renderCreateCustomerModal()}
      </React.Fragment>
    );
  }
}

export default withRouter(Customers);
