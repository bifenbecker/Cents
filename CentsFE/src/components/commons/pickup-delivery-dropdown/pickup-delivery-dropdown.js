import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import MultiSelectWithInput from "../multi-select-with-input/multi-select-with-input";
import {SERVICE_TYPES} from "../../../constants";

const PickupDeliveryDropdown = ({serviceType, onServiceTypeChange}) => {
  const [dropdownValue, setDropdownValue] = useState([]);

  useEffect(() => {
    setDropdownValue([serviceType || "ALL"]);
  }, [serviceType]);

  const handleOnChange = (value) => {
    if (value?.length) {
      setDropdownValue(value);
      onServiceTypeChange(value[0]);
    }
  };
  return (
    <div>
      <MultiSelectWithInput
        label="Service"
        header=""
        itemName="Pickup & Delivery"
        options={SERVICE_TYPES || []}
        value={dropdownValue}
        onChange={handleOnChange}
        isPickupDeliveryDropdown
        className="pickup-delivery-multi-select-dropdown"
      />
    </div>
  );
};

PickupDeliveryDropdown.propTypes = {
  serviceType: PropTypes.string.isRequired,
  onServiceTypeChange: PropTypes.func.isRequired,
};

export default PickupDeliveryDropdown;
