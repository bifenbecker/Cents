import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import locationIcon from "../../../../../../assets/images/location.svg";
import phoneIcon from "../../../../../../assets/images/phone.svg";
import { usa_state_list } from "../../../../../../constants";

import TextField from "../../../../../commons/textField/textField";
import MaterialSelect from "../../../../../commons/select/select";

const formattedDistrictName = (district) => {
  if (!district) {
    return district;
  }

  return [district?.regionName?.toUpperCase() || "", district?.name || ""].join(
    ": "
  );
};

const LocationForm = (props) => {
  const {
    location,
    setLocationField,
    errorFields,
    needsRegions,
    districts,
    districtsCallInProgress,
  } = props;

  return (
    <div className="locations-card-content">
      <div className="location-form-screen-content">
        <div className="location-form-container">
          <div className="input-container">
            <img src={locationIcon} alt="locations" />
            <TextField
              error={errorFields.name}
              label="Location Name"
              className="account-settings-input location-form-input"
              value={location.name}
              onChange={(evt) => setLocationField("name", evt)}
              maxLength={50}
            />
          </div>
          <div className="input-container">
            <TextField
              label="Address"
              error={errorFields.address}
              className="account-settings-input location-form-input"
              value={location.address}
              onChange={(evt) => setLocationField("address", evt)}
              maxLength={35}
            />
          </div>
          <div className="input-container">
            <TextField
              label="City"
              error={errorFields.city}
              className="account-settings-input location-form-input"
              value={location.city}
              onChange={(evt) => setLocationField("city", evt)}
            />
          </div>
          <div className="input-container">
            <MaterialSelect
              label="State"
              maxMenuHeight={180}
              menuShouldScrollIntoView={true}
              error={errorFields.state}
              className="account-settings-input location-form-input"
              value={
                location.state
                  ? {
                      value: location.state,
                      label: location.state,
                    }
                  : null
              }
              options={usa_state_list.map((state) => {
                return { value: state, label: state };
              })}
              onChange={(evt) => setLocationField("state", evt)}
            />
          </div>
          <div className="input-container">
            <TextField
              label="Zip"
              error={errorFields.zipCode}
              className="account-settings-input location-form-input"
              value={location.zipCode}
              onChange={(evt) => setLocationField("zipCode", evt)}
              maxLength={5}
            />
          </div>
          {needsRegions ? (
            <div className="input-container">
              <div className="district-select">
                <MaterialSelect
                  maxMenuHeight={180}
                  menuPlacement="auto"
                  menuShouldScrollIntoView={true}
                  label="District"
                  error={errorFields.districtId}
                  options={districts.map((district) => {
                    return {
                      value: district.id,
                      label: formattedDistrictName(district),
                    };
                  })}
                  className="account-settings-input location-form-input"
                  value={
                    location.districtId
                      ? {
                          value: location.districtId,
                          label: formattedDistrictName(
                            districts.find(
                              (dist) => dist.id === location.districtId
                            )
                          ),
                        }
                      : null
                  }
                  onChange={(evt) => setLocationField("districtId", evt)}
                />
                {districtsCallInProgress ? (
                  <FontAwesomeIcon
                    className="districts-spinner"
                    icon={faSpinner}
                    spin
                  />
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="input-container">
            <img src={phoneIcon} alt="locations" />
            <TextField
              label="Phone"
              error={errorFields.phoneNumber}
              className="account-settings-input location-form-input"
              value={location.phoneNumber}
              onChange={(evt) => setLocationField("phoneNumber", evt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationForm;
