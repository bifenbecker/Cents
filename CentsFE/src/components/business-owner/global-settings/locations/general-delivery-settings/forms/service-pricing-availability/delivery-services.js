import React, {useState} from "react";
import {useFlags} from "launchdarkly-react-client-sdk";
import Dropdown from "./Dropdown";
import closeImg from "../../../../../../../assets/images/close.svg";
import Radio from "components/commons/radio/radio";

const DeliveryService = ({
  selectedServicesOptions,
  isMoreSelectionAvailable,
  groupedServiceOptions,
  handleOnChangeServices,
  handleAddService,
  showHeaderText,
  showDropdown,
  hasDryCleaningServices,
  offerDryCleaningForDelivery,
  saveDryCleaningToggle,
}) => {
  const flags = useFlags();
  const [offerDryCleaning, setOfferDryCleaning] = useState(
    offerDryCleaningForDelivery || false
  );

  /**
   * Change the state value of the offerDryCleaning option
   */
  const handleOfferDryCleaningChange = () => {
    setOfferDryCleaning(!offerDryCleaning);
    saveDryCleaningToggle(!offerDryCleaning);
  };

  return (
    <div>
      {showHeaderText && (
        <div>
          <p className="lable-info-header-text">
            Which Wash & Fold services do you
            <br />
            want to offer for pickup & delivery ?
          </p>
          <small>
            We recommend a maximum of 2-3 services.
            <br />
            Your customer can only choose 1.
          </small>
        </div>
      )}
      {flags?.cents20 && hasDryCleaningServices && (
        <div className="type-radio-button offer-dry-cleaning-container">
          <Radio selected={offerDryCleaning} onChange={handleOfferDryCleaningChange} />
          Offer Dry Cleaning service
        </div>
      )}
      {showDropdown && (
        <div className="delivery-service__dropdown-container">
          {selectedServicesOptions?.map((selectedOption, index) => {
            return !selectedServicesOptions[0] && !isMoreSelectionAvailable ? null : (
              <div key={selectedOption?.value || index} className="dropdown-item-wrapper">
                <Dropdown
                  options={groupedServiceOptions}
                  defaultValue={selectedOption}
                  onChange={(selected) => handleOnChangeServices(selected, index)}
                  placeholder={flags.cents20 ? "Wash & Fold Service" : "Service"}
                />
                {selectedServicesOptions.length && (
                  <div className="close-icon">
                    <img
                      alt="icon"
                      src={closeImg}
                      onClick={() => handleOnChangeServices(undefined, index)}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {isMoreSelectionAvailable ? (
            <div className="add-service" onClick={handleAddService}>
              <p className="plus-button">+</p>
              <p>Add another service</p>
            </div>
          ) : (
            <div className="add-service">
              <p>No services to select</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default DeliveryService;
