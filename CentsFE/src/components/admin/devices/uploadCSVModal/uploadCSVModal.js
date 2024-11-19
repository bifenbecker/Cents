import React from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import * as devicesAPI from "../../../../api/admin/devices.js";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";

class UploadCSV extends React.Component {
  state = {
    file: null,
    error: null,
    isUploaded: false
  };

  handleInputClick = e => {
    // to detect same file upload
    e.target.value = "";
  };

  handleInputChange = e => {
    this.setState({ file: e.target.files[0], error: null });
  };

  uploadCsv = async () => {
    this.setState({ error: null });
    let formData = new FormData();
    formData.append("deviceList", this.state.file);
    formData.append("businessId", this.props.businessId);

    try {
      this.props.setUploadProgress(true);
      const res = await devicesAPI.uploadDevices(formData);
      this.props.setUploadProgress(false);
      const data = res.data;
      if (data.success === true) {
        this.props.clearDevicesError();
        this.props.setCurrentBusinessOwner(
          this.props.businessId,
          this.props.currentPage
        );
        this.setState({ error: null, isUploaded: true });
      }
    } catch (err) {
      let error = err.response.data.error;
      this.props.setUploadProgress(false);
      this.setState({ error, file: null });
    }
  };

  handleCloseModal = () => {
    this.props.closeCSVUploadModal();
    this.setState({
      file: null,
      error: null,
      isUploaded: false
    });
  };

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={this.props.toggle}
        className="upload-csv-modal"
      >
        {
          this.props.isUploadInProgress
          ?
            <BlockingLoader className={"loader"} />
          :
            null
        }
        <ModalBody>
          {!this.state.isUploaded && (
            <div className="upload-csv-container">
              <div className="button-to-upload">
                <form ref={el => (this.form = el)}>
                  <input
                    type="file"
                    accept="text/csv"
                    ref={file => (this.fileInput = file)}
                    id="input-file"
                    onClick={this.handleInputClick}
                    onChange={this.handleInputChange}
                  />
                  <label htmlFor="input-file" id="label-file">
                    Browse files to upload
                  </label>
                </form>
              </div>
              {this.state.file && !this.state.error && (
                <div className="uploaded-file">
                  <FontAwesomeIcon icon={faFileAlt} className="icon-file" />
                  <span>{this.state.file.name}</span>
                </div>
              )}
              {this.state.error && (
                <div>
                  <span style={{ color: "red" }}>{this.state.error}</span>
                </div>
              )}
            </div>
          )}

          {this.state.isUploaded && (
            <div className="upload-success-container">
              <FontAwesomeIcon icon={faCheckCircle} className="icon-success" />
              <span>File upload successful</span>
              <button
                className="btn-theme btn-transparent"
                onClick={this.handleCloseModal}
              >
                OK
              </button>
            </div>
          )}
        </ModalBody>
        {!this.state.isUploaded && (
          <ModalFooter>
            <div className="buttons-container">
              <Button
                className="btn-theme btn-transparent"
                onClick={this.handleCloseModal}
              >
                Cancel
              </Button>
              <Button className="btn-theme" onClick={this.uploadCsv}>
                Upload
              </Button>
            </div>
          </ModalFooter>
        )}
      </Modal>
    );
  }
}

export default UploadCSV;
