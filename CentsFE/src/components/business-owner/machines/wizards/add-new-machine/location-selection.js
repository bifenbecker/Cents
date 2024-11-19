import React from "react";

import locationIcon from "../../../../../assets/images/location.svg";

import WizardStep from "../../common/wizard-step";
import IconSelect from "../../../../commons/icon-select/IconSelect";

const LocationSelection = (props) => {
  const {locations, machine, setMachine, ...rest} = props;

  const locationOptions = locations?.all
    ?.filter((item) => locations?.selected?.includes(item?.id))
    ?.map((item) => ({label: item?.name, value: item?.id}));

  const onLocationChange = (selectedOption) => {
    setMachine((state) => ({...state, storeId: selectedOption?.value}));
  };

  return (
    <WizardStep header="Select a location" isSaveDisabled={!machine?.storeId} {...rest}>
      <div className="description-with-input">
        <p>
          Which location should the machine <br /> be added to?
        </p>
        <IconSelect
          smallHeight
          icon={locationIcon}
          className="location-selection"
          label="Select a Location"
          options={locationOptions}
          value={locationOptions?.find((item) => item?.value === machine?.storeId)}
          onChange={onLocationChange}
        />
      </div>
    </WizardStep>
  );
};

export default LocationSelection;
