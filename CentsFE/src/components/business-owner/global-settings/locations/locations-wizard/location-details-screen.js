import React, { useMemo, useState } from "react";

import {
  displayErrorMessages,
  validateFormFactory,
} from "../utils/validations";
import { isLocationDetailsSaveDisabled } from "../utils/location";

import { locationDetailsSchema } from "./location-steps.schema";
import WizardFooter from "./wizard-footer";
import WizardHeader from "./wizard-header";
import LocationForm from "../common/location-form/location-form";

const locationDetailsValidator = validateFormFactory(locationDetailsSchema);

const LocationDetailsScreen = (props) => {
  const {
    location,
    setLocationField,
    addLocationStep,
    moveToStep,
    errorMessage,
    closeScreen,
    onSubmit,
    needsRegions,
    districts,
    districtsCallInProgress,
  } = props;

  const [errorFields, setErrorFields] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    districtId: "",
  });

  const isSaveDisabled = useMemo(() => {
    return isLocationDetailsSaveDisabled(location, needsRegions);
  }, [location, needsRegions]);

  const fieldErrors = useMemo(() => displayErrorMessages(errorFields), [
    errorFields,
  ]);

  const onSave = async () => {
    const isValid = await locationDetailsValidator(location, setErrorFields);
    if (isValid) {
      onSubmit();
    }
  };

  return (
    <>
      <WizardHeader
        addLocationStep={addLocationStep}
        moveToStep={moveToStep}
        title="New Location"
      />
      <LocationForm
        location={location}
        setLocationField={setLocationField}
        needsRegions={needsRegions}
        districts={districts}
        districtsCallInProgress={districtsCallInProgress}
        errorFields={errorFields}
      />
      <WizardFooter
        addLocationStep={addLocationStep}
        errorMessage={errorMessage || fieldErrors}
        closeScreen={closeScreen}
        isSaveDisabled={isSaveDisabled}
        onSave={onSave}
      />
    </>
  );
};

export default LocationDetailsScreen;
