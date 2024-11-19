import React, {useState, Fragment, useMemo} from "react";
import role_side_panel from "../../../../assets/images/Icon_Role_Side_Panel.svg";
import notesIcon from "../../../../assets/images/Icon_Notes_Cycle_Details.svg";
import TextField from "../../../commons/textField/textField";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {Progress} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PriceListItem from "../../global-settings/price-list-item";
import Checkbox from "../../../commons/checkbox/checkbox";
import ToggleSwitch from "../../../commons/toggle-switch/toggleSwitch";

const ServiceWizard = (props) => {
  const [formInputs, setFormInputs] = useState({
    serviceType: props.activeRoundedTab,
    serviceName: "",
    description: "",
  });
  const allServicesSelected = useMemo(() => {
    return props.newServicePriceItems?.prices?.every((price) => price.isFeatured);
  }, [props.newServicePriceItems]);

  const handleFormInput = (evt, validate) => {
    const newInput = {
      [evt.target.name]: validate
        ? evt.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
        : evt.target.value,
    };
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      ...newInput,
    }));
  };

  const handleSave = () => {
    if (!props.showNewServicesPricingScreen) {
      props.handleShowNewServicesPricingScreen(true);
    } else {
      const data = {
        serviceCategoryId:
          formInputs.serviceType === "per-pound"
            ? props.servicesCategoryList.perPoundId
            : props.servicesCategoryList.fixedPriceId,
        name: formInputs.serviceName,
        description: formInputs.description,
        hasMinPrice:
          formInputs.serviceType === "per-pound"
            ? props.newServicePriceItems.hasMinPrice
            : false,
        prices: props.newServicePriceItems.prices,
        servicePricingStructureId: formInputs.serviceType === "per-pound" ? 1 : 2,
      };
      props.addNewService(data, {archived: props.showArchivedServices});
    }
  };

  const handleDisable = () => {
    if (!props.showNewServicesPricingScreen) {
      const {serviceName, serviceType} = formInputs;
      const disableNextButton = [serviceName, serviceType].includes("");
      return disableNextButton;
    }
  };

  const renderPrices = () => {
    if (!props.newServicePriceItems) {
      return null;
    }

    return props.newServicePriceItems.prices.map((price, index) => {
      let serviceItem = {
        minQty: price.minQty,
        price: price.storePrice,
        title: price.store?.name,
        minPrice: price.minPrice,
        isTaxable: price?.isTaxable,
        isSelected: price.isFeatured,
        hasMinPrice:
          formInputs.serviceType === "per-pound"
            ? props.newServicePriceItems.hasMinPrice
            : false,
        priceUnit: formInputs.serviceType === "per-pound" ? "lb" : "unit",
      };

      return (
        <PriceListItem
          type="SERVICE"
          key={`service-location-${price.id}`}
          item={serviceItem}
          showApplyToAll={
            index ===
            props.newServicePriceItems?.prices?.findIndex((price) => price.isFeatured)
          }
          unselectedMessage="Not featured in this location"
          onChange={(field, value) => {
            const formField = field === "isSelected" ? "isFeatured" : field;
            const formValue =
              typeof value === "boolean"
                ? value
                : value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
            const storeId = price.storeId;
            props.handleChange(formValue, storeId, formField);
          }}
          onApplyAll={() => props.handleApplyAll(index)}
        />
      );
    });
  };

  const renderServiceNameScreen = () => (
    <Fragment>
      {!props.isInServiceEditMode && (
        <div className="type-of-service-selection">
          <div className="service-radio-button">
            <input
              type="radio"
              value="per-pound"
              name="serviceType"
              onChange={(evt) => {
                handleFormInput(evt);
              }}
              checked={formInputs.serviceType === "per-pound"}
            />
            <p>Priced Per Lb</p>
          </div>
          <div className="service-radio-button">
            <input
              type="radio"
              value="fixed-price"
              name="serviceType"
              onChange={(evt) => {
                handleFormInput(evt);
              }}
              checked={formInputs.serviceType === "fixed-price"}
            />
            <p>Fixed Price</p>
          </div>
        </div>
      )}
      <div className="service-input-containers">
        <div className="input-container">
          <img src={role_side_panel} className="icon" alt="" />
          <TextField
            label="Service Name"
            className="service-name-input"
            name="serviceName"
            onChange={(evt) => {
              handleFormInput(evt);
            }}
            value={formInputs.serviceName}
          />
        </div>
        <div className="input-container">
          <img src={notesIcon} className="icon" style={{marginBottom: "60px"}} alt="" />
          <textarea
            name="description"
            placeholder="Description"
            onChange={(evt) => {
              handleFormInput(evt);
            }}
            value={formInputs.description}
          />
        </div>
      </div>
    </Fragment>
  );
  const toggleAllServiceSelection = () => {
    props.handleSelectAll(!allServicesSelected);
  };
  const showHeaders = () => {
    let showHeader = props.newServicePriceItems?.prices?.some(
      (price) => price.isFeatured
    );
    if (
      formInputs?.serviceType === "per-pound" &&
      props.newServicePriceItems?.hasMinPrice
    ) {
      showHeader = false;
    }
    return showHeader;
  };

  return (
    <Fragment>
      <div className="locations-card-header wizard-header">
        {props.showNewServicesPricingScreen && (
          <div
            className="back-button-container"
            onClick={() => {
              props.handleShowNewServicesPricingScreen(false);
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="back-chevron-icon" />
            <button className="btn btn-text-only cancel-button">{`Back`}</button>
          </div>
        )}
        <p>
          {props.showNewServicesPricingScreen ? "New Service Pricing" : "New Service"}
        </p>
      </div>
      <Progress
        value={props.showNewServicesPricingScreen ? 95 : 50}
        className="_progressbar"
      />

      {props.showNewServicesPricingScreen ? (
        <div className={`service-creation-container service-pricing`}>
          {formInputs.serviceType === "per-pound" && (
            <div className="service-minimum-toggle">
              <p>There is a minimum</p>
              <ToggleSwitch
                className="hub-toggle"
                checked={!!props.newServicePriceItems?.hasMinPrice}
                onChange={props.handleMinimumToggle}
              />
            </div>
          )}
          <div className="product-qty-price-header">
            <div className="select-all-container">
              <Checkbox
                checked={allServicesSelected}
                onChange={toggleAllServiceSelection}
              />
              <button
                onClick={toggleAllServiceSelection}
                className="btn btn-text-only cancel-button"
              >
                {allServicesSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            {showHeaders() ? (
              <div className="create-service-headers">
                <span className="bold-text service-header-margin">
                  Price{formInputs.serviceType === "per-pound" ? " / Lb" : ""}
                </span>
                <span className="bold-text service-header-margin">Taxable</span>
              </div>
            ) : null}
          </div>
          <div className="service-prices-container">{renderPrices()}</div>
        </div>
      ) : (
        <div className={`service-creation-container`}>
          <div className="service-creation-form">{renderServiceNameScreen()}</div>
        </div>
      )}

      <div className="service-prices-footer">
        <p className="service-footer-error-message new-service">
          {props.addNewServiceError}{" "}
        </p>
        <button
          className="btn btn-text-only cancel-button"
          onClick={() => {
            props.showHideNewServiceWizard(false);
            props.handleShowNewServicesPricingScreen(false);
          }}
        >
          Cancel
        </button>
        <button
          className="btn-theme btn-rounded save-button"
          disabled={handleDisable()}
          onClick={handleSave}
        >
          {props.showNewServicesPricingScreen ? "SAVE" : "NEXT"}
        </button>
      </div>
      {props.addNewServiceCallInProgress || props.newServicePricingCallProgress ? (
        <BlockingLoader />
      ) : null}
    </Fragment>
  );
};

export default ServiceWizard;
