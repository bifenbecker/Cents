import React, {useState, useEffect, useCallback, useMemo} from "react";
import {useSelector} from "react-redux";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileAlt, faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import locationIcon from "../../../../assets/images/location.svg";

import {uploadPairingCSV} from "../../../../api/business-owner/devices";
import {
  fetchAssignedLocations,
  fetchLocations,
} from "../../../../api/business-owner/locations";
import {useHistory} from "react-router-dom";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import IconSelect from "../../../commons/icon-select/IconSelect";
import {getParsedLocalStorageData} from "../../../../utils/functions";
import {SESSION_ENV_KEY} from "../../../../utils/config";
import {ROLES} from "../../../../constants";

const UploadCSVModal = (props) => {
  const {isOpen, toggleModal} = props;
  const history = useHistory();

  const storedLocations = useSelector(
    (state) => state?.businessOwner?.dashboard?.allLocations?.locations
  );

  // Location states
  const [locationsList, setLocationsList] = useState();
  const [locationsFetching, setLocationsFetching] = useState(false);
  const [locationsFetchError, setLocationsFetchError] = useState();

  const isOwner = useMemo(
    () => getParsedLocalStorageData(SESSION_ENV_KEY)?.roleName === ROLES.owner,
    []
  );

  const fetchAndSetLocations = useCallback(async () => {
    try {
      setLocationsFetching(true);
      const res = isOwner ? await fetchLocations() : await fetchAssignedLocations();
      setLocationsList(res?.data?.allLocations || []);
    } catch (e) {
      setLocationsFetchError(e?.data?.response?.error || e?.message);
    } finally {
      setLocationsFetching(false);
    }
  }, [isOwner]);

  useEffect(() => {
    if (storedLocations?.length) {
      setLocationsList(storedLocations);
    } else {
      fetchAndSetLocations();
    }
  }, [fetchAndSetLocations, storedLocations]);

  const options = locationsList?.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  // Upload file state
  const [file, setFile] = useState();
  const [error, setError] = useState();
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorList, setErrorList] = useState();
  const [storeData, setStoreData] = useState();

  const handleInputClick = (e) => {
    e.target.value = "";
    setError();
    setErrorList();
  };

  const handleInputChange = (e) => {
    const fileName = e.target.files[0];
    const allowedExtensions = /(\.csv)$/i;
    if (allowedExtensions.exec(fileName.name)) {
      setFile(fileName);
      setError();
      setErrorList();
    } else {
      setError("Please upload a csv file");
    }
  };

  const uploadCsv = async () => {
    setError();
    setErrorList();

    let formData = new FormData();
    formData.append("machinesPairing", file);
    formData.append("storeId", storeData?.value);

    try {
      setIsUploading(true);
      const res = await uploadPairingCSV(formData);
      setIsUploading(false);
      const data = res?.data;
      if (data?.success === true) {
        setError();
        setErrorList();
        setIsUploaded(true);
        history.push("/dashboard/machines");
      }
    } catch (err) {
      let errorObj = err?.response?.data;
      setIsUploading(false);
      setError(errorObj?.error);
      if (errorObj?.errors && errorObj?.errors?.length) {
        setErrorList(errorObj?.errors);
      }
      setFile();
    }
  };

  const handleCloseModal = () => {
    setFile();
    setError();
    setErrorList();
    setIsUploaded();
    setIsUploading();
    toggleModal();
  };

  const onLocationChange = (selectedOption) => {
    setStoreData(selectedOption);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggleModal}
      className="upload-csv-modal"
      backdrop="static"
    >
      <ModalHeader>
        <div className="modal-header-container">
          <p className="header-text">Upload Pairing</p>
          <a
            href="https://assets.trycents.com/machines-pairing.csv"
            rel="noopener noreferrer"
            className="download-link"
          >
            Download Template CSV
          </a>
        </div>
      </ModalHeader>
      {isUploading || locationsFetching ? <BlockingLoader className="loader" /> : null}

      <ModalBody>
        {isUploaded ? null : (
          <div className="location-dropdown-container">
            <IconSelect
              smallHeight
              icon={locationIcon}
              className="location-dropdown-selection"
              placeholder="Select a Location"
              options={options}
              value={storeData}
              onChange={onLocationChange}
            />
            {locationsFetchError ? (
              <div className="message-block error-message mt-2 text-center">
                {locationsFetchError}
              </div>
            ) : null}
          </div>
        )}
        {isUploaded ? (
          <div className="upload-success-container">
            <FontAwesomeIcon icon={faCheckCircle} className="icon-success" />
            <span>File upload successful</span>
            <button className="btn-theme btn-transparent" onClick={handleCloseModal}>
              OK
            </button>
          </div>
        ) : (
          <div className="upload-csv-container">
            <div className="button-to-upload">
              <form>
                <input
                  type="file"
                  accept="text/csv"
                  id="input-file"
                  onClick={handleInputClick}
                  onChange={handleInputChange}
                />
                <label htmlFor="input-file" id="label-file">
                  Browse files to upload
                </label>
              </form>
            </div>
            {file && !error && !errorList && (
              <div className="uploaded-file">
                <FontAwesomeIcon icon={faFileAlt} className="icon-file" />
                <span>{file?.name}</span>
              </div>
            )}

            {error ? <div className="message-block error-message">{error}</div> : null}
          </div>
        )}
        {errorList && (
          <div className="error-message-container">
            {errorList.map((errordata) => {
              return (
                <div className="error-message">
                  Row - {errordata.row}: {errordata.error}
                </div>
              );
            })}
          </div>
        )}
      </ModalBody>
      {!isUploaded && (
        <ModalFooter>
          <div className="buttons-container">
            <Button className="btn-theme btn-transparent" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              className="btn-theme"
              onClick={uploadCsv}
              disabled={!file || !storeData}
            >
              Upload
            </Button>
          </div>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default UploadCSVModal;
