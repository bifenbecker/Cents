import React, { useMemo, useState } from "react";

import { locationDetailsSchema } from "../locations-wizard/location-steps.schema";
import closeIcon from "../../../../../assets/images/Icon_Exit_Side_Panel.svg";
import { isLocationDetailsSaveDisabled } from "../utils/location";

import FooterWithSave from "../common/footer-with-save";
import LocationForm from "../common/location-form/location-form";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import {
  displayErrorMessages,
  validateFormFactory,
} from "../utils/validations";

const initState = {
  name: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  districtId: null,
};

const locationDetailsValidator = validateFormFactory(locationDetailsSchema);

const EditLocation = (props) => {
  const {
    selectedLocation,
    needsRegions,
    districts,
    districtsCallInProgress,
    errorMessage,
    closeScreen,
    updateLocationInfo,
    saveLocationCallInProgress,
  } = props;

  const [location, setLocation] = useState({ ...selectedLocation });
  const [errorFields, setErrorFields] = useState({ ...initState });

  const setLocationField = (field, evt) => {
    const value = ["districtId", "state"].includes(field)
      ? evt.value
      : evt.target.value;
    setLocation((state) => ({
      ...state,
      [field]: value,
    }));
  };

  const onSaveClick = async () => {
    const isValid = await locationDetailsValidator(location, setErrorFields);
    if (isValid) {
      await updateLocationInfo(location);
    }
  };

  const fieldErrors = useMemo(() => displayErrorMessages(errorFields), [
    errorFields,
  ]);

  const isSaveDisabled = useMemo(() => {
    return isLocationDetailsSaveDisabled(location, needsRegions);
  }, [location, needsRegions]);

  if (!selectedLocation) {
    return (
      <div className="locations-card-container d-flex flex-column align-items-center justify-content-center justify-self-center">
        Please select a location
      </div>
    );
  }

  return (
    <>
      {saveLocationCallInProgress ? <BlockingLoader /> : null}
      <div className="locations-card-header edit-location">
        <img
          src={closeIcon}
          className="close-icon"
          alt="icon"
          onClick={closeScreen}
        />
      </div>
      <p className="edit-location-header">Edit Location Address</p>
      <LocationForm
        location={location}
        setLocationField={setLocationField}
        needsRegions={needsRegions}
        districts={districts}
        districtsCallInProgress={districtsCallInProgress}
        errorFields={errorFields}
      />
      <FooterWithSave
        errorMessage={errorMessage || fieldErrors}
        closeScreen={closeScreen}
        isSaveDisabled={isSaveDisabled}
        onSave={onSaveClick}
      />
    </>
  );
};

export default EditLocation;
