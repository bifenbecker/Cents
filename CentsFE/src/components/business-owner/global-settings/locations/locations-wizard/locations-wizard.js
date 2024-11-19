import React, {useRef, useEffect, useState} from "react";

import LocationBusinessDetails from "./location-business-details";
import LocationPasswordScreen from "./location-password-screen";
import AddTaxScreen from "../../../../../containers/bo-locations-add-tax-rate";
import LocationDetailsScreen from "./location-details-screen";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";

import useTrackEvent from "../../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../constants/intercom-events";
import PropTypes from "prop-types";

const locationInitState = {
  name: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  districtId: null,
  dcaLicense: "",
  taxRate: null,
  password: "",
  confirmPassword: "",
};

const LocationWizard = ({
  addLocationStep,
  closeScreen,
  needsRegions,
  districts,
  districtsCallInProgress,
  moveToStep,
  errorMessage,
  saveLocationCallInProgress,
  taxRatesList,
  createNewLocation,
  addNewTaxRate,
  showAddTaxScreen,
  newTaxRateWhileLocationCreation,
}) => {
  const wizardStep = useRef(1);
  const {trackEvent} = useTrackEvent();

  useEffect(() => {
    trackEvent(INTERCOM_EVENTS.addLocation, INTERCOM_EVENTS_TEMPLATES.trackLocationForm, {
      "Button Name": "+",
    });
    return () => {
      trackEvent(
        INTERCOM_EVENTS.addLocation,
        INTERCOM_EVENTS_TEMPLATES.trackLocationForm,
        {
          "Button Name": "Cancel",
          "Wizard Step": wizardStep.current,
        }
      );
      wizardStep.current = 1;
      closeScreen();
    };
  }, [closeScreen, trackEvent]);

  const [location, setLocation] = useState({
    ...locationInitState,
    needsRegions,
  });

  const setLocationField = (field, evt) => {
    let value;
    switch (field) {
      case "taxRate":
        value = evt.taxRate;
        break;
      case "districtId":
      case "state":
        value = evt.value;
        break;
      case "name":
      case "address":
      case "city":
        value = evt.target.value;
        break;
      default:
        value = evt.target.value.trim();
        break;
    }
    setLocation((state) => ({
      ...state,
      [field]: value,
    }));
  };

  const submitHandler = async () => {
    if (addLocationStep !== 3) {
      trackEvent(
        INTERCOM_EVENTS.addLocation,
        INTERCOM_EVENTS_TEMPLATES.trackLocationForm,
        {
          "Button Name": "Next",
          "Wizard Step": wizardStep.current,
        }
      );
      wizardStep.current = addLocationStep;
      moveToStep(addLocationStep + 1);
    } else {
      await createNewLocation(location);
      trackEvent(
        INTERCOM_EVENTS.addLocation,
        INTERCOM_EVENTS_TEMPLATES.trackLocationForm,
        {
          "Button Name": "Save",
          "Wizard Step": wizardStep.current,
        }
      );
      wizardStep.current = addLocationStep;
    }
  };

  useEffect(() => {
    if (newTaxRateWhileLocationCreation?.id) {
      setLocation((state) => ({
        ...state,
        taxRate: newTaxRateWhileLocationCreation,
      }));
    }
  }, [newTaxRateWhileLocationCreation]);

  let currentStepProps = {
      moveToStep,
      closeScreen,
      addLocationStep,
      location,
      setLocationField,
      errorMessage,
      onSubmit: submitHandler,
    },
    currentStep = null;

  switch (addLocationStep) {
    case 1:
      currentStepProps = {
        title: "New Location",
        needsRegions,
        districts,
        districtsCallInProgress,
        ...currentStepProps,
      };
      currentStep = <LocationDetailsScreen {...currentStepProps} />;
      break;
    case 2:
      currentStepProps = {
        title: "Business Details",
        taxRatesList,
        addNewTaxRate,
        ...currentStepProps,
      };
      currentStep = <LocationBusinessDetails {...currentStepProps} />;
      break;
    case 3:
      currentStepProps = {
        title: "Tablet App Login Setup",
        ...currentStepProps,
      };
      currentStep = <LocationPasswordScreen {...currentStepProps} />;
      break;
  }

  // Return funcs.

  if (showAddTaxScreen) {
    return <AddTaxScreen />;
  }

  return (
    <>
      {currentStep}
      {saveLocationCallInProgress && <BlockingLoader />}
    </>
  );
};

LocationWizard.propTypes = {
  addLocationStep: PropTypes.number,
  closeScreen: PropTypes.func,
  needsRegions: PropTypes.bool,
  districts: PropTypes.array,
  districtsCallInProgress: PropTypes.bool,
  moveToStep: PropTypes.func,
  errorMessage: PropTypes.string,
  saveLocationCallInProgress: PropTypes.bool,
  taxRatesList: PropTypes.array,
  createNewLocation: PropTypes.func,
  addNewTaxRate: PropTypes.func,
  showAddTaxScreen: PropTypes.bool,
  newTaxRateWhileLocationCreation: PropTypes.any,
};

export default LocationWizard;
