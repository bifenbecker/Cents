// Package imports
import React, {useCallback, useEffect} from "react";

// Icons
import locationPin from "../../../../../assets/images/location_pin.svg";
import angleRight from "../../../../../assets/images/angle_right.svg";

// Components
import ToggleSwitch from "../../../../commons/toggle-switch/toggleSwitch";
import TextField from "../../../../commons/textField/textField";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import Modal from "../../../../commons/modal/modal";
import useTrackEvent from "../../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../constants/intercom-events.js";

const Regions = ({
  fetchAccountDetails,
  accountSettings,
  handleRegionClick,
  modalRegionChangeHandler,
  addNewDistrict,
  handlePopUpClose,
  formChangeHandler,
  saveRegionChanges,
}) => {
  const accountDetails = accountSettings.accountDetails;

  const {trackEvent} = useTrackEvent();
  const onRegionsCheck = useCallback(
    (value) => {
      formChangeHandler("needsRegions", value);

      trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
        Description: "Regions & Districts Enabled/Disabled",
        Enabled: value,
      });
    },
    [formChangeHandler, trackEvent]
  );

  useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);

  const _renderRegionsAndDistricts = (regions) => {
    if (!regions) {
      return null;
    }

    return regions.map((region) => {
      let districtsString = "";
      for (const [index, district] of region.districts.entries()) {
        if (index !== 0) {
          districtsString += `, ${district.name}`;
        } else {
          districtsString += district.name;
        }
      }

      return (
        <div
          key={region.id.toString()}
          className="region-item"
          onClick={() => handleRegionClick(region.id)}
        >
          <img alt="icon" className="angleRight" src={angleRight}></img>
          <p className="region-name">{region.name}</p>
          <p className="districts">{districtsString}</p>
        </div>
      );
    });
  };

  const _render_regions_modal_content = () => {
    let region = accountSettings.modalRegion;
    if (!region) {
      region = {
        name: "",
        districts: [],
      };
    }
    return (
      <div className="region-popup-container">
        {accountSettings.regionSaveInProgress ? <BlockingLoader /> : null}
        <div className="region-popup-head">
          <p className="header">Region Setup</p>
        </div>
        <div className="region-popup-content">
          <form>
            <TextField
              key={`region-${region.id}`}
              className="region-popup-text region-field"
              label="Region Name"
              value={region.name === undefined ? "" : region.name}
              onChange={(e) => modalRegionChangeHandler("region", null, e.target.value)}
            />
            <div className="districts-container">
              {region.districts &&
                region.districts.map((dist, index) => (
                  <TextField
                    key={`dist-${dist.id}-${index}`}
                    className="region-popup-text district-field"
                    label={`District ${index + 1} name`}
                    value={dist.name}
                    onChange={(e) =>
                      modalRegionChangeHandler("district", index, e.target.value)
                    }
                  />
                ))}
              <div className="add-new-button" onClick={addNewDistrict}>
                <p>
                  <span>+</span> Add new district
                </p>
              </div>
            </div>
            <p className="error-message">{accountSettings.regionSaveError}</p>
            <button
              className="btn-theme form-save-button"
              onClick={(e) => {
                e.preventDefault();
                saveRegionChanges(region);
              }}
            >
              SAVE
            </button>
            <p className="cancel-button" onClick={handlePopUpClose}>
              Cancel
            </p>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="account-settings-container">
      <div className="form-section regions-section">
        <img alt="icon" src={locationPin}></img>
        <div className="form-fields-container">
          <div className="toggle-container">
            <p>Regions & Districts</p>
            <ToggleSwitch
              checked={accountDetails.needsRegions}
              onChange={onRegionsCheck}
            />
          </div>
        </div>
      </div>
      {accountDetails.needsRegions && (
        <div className="form-section regions-list-section">
          <div
            className="region-item add-new-button"
            onClick={() => {
              handleRegionClick();
            }}
          >
            <p>
              <span>+</span> Add new region
            </p>
          </div>
          {_renderRegionsAndDistricts(accountDetails.regions)}
        </div>
      )}

      {accountSettings.showRegionModal && (
        <Modal>{_render_regions_modal_content()}</Modal>
      )}
    </div>
  );
};

export default Regions;
