import React, {Fragment, useEffect, useRef} from "react";
import kebabCase from "lodash/kebabCase";
import {Link} from "react-router-dom";

import PriceListItem from "../price-list-item";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import {servicesAndProductsTabValues} from "../../../../constants";
import Checkbox from "../../../commons/checkbox/checkbox";
import {useFlags} from "launchdarkly-react-client-sdk";
import {isEmpty, sortBy} from "lodash";

const PricePerService = (props) => {
  const flags = useFlags();
  const listContainerDivRef = useRef(null);

  let {
    fetchServicesOfLocation,
    handleChange,
    fromPromotions,
    isDetails,
    fetchServicesList,
    fetchDryCleaningAndServicesList,
  } = props;
  let {
    selectedLocation,
    activeLocationServices,
    isServiceCallInProgress,
    servicesError,
    activeServicesAndProductsTab,
  } = props.locations;
  // Reload data if location changes or serive tab changes

  const dependenciesArray = fromPromotions
    ? []
    : [fetchServicesOfLocation, selectedLocation.id, activeServicesAndProductsTab];

  useEffect(
    () => {
      if (fromPromotions) {
        flags.cents20
          ? fetchDryCleaningAndServicesList(isDetails)
          : fetchServicesList(isDetails);
      } else {
        fetchServicesOfLocation(selectedLocation.id);
      }
      if (listContainerDivRef.current) {
        listContainerDivRef.current.scrollTop = 0;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependenciesArray
  );

  useEffect(
    () => {
      if (fromPromotions && props.promotions.servicesList.length > 1) {
        props.handleServicesTabSwitch(activeServicesAndProductsTab);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeServicesAndProductsTab]
  );

  const filterServices = (promo = false) => {
    const services = promo ? props.promotions.servicesList : activeLocationServices;
    let activeCategory;
    let category = {};
    if (flags.cents20) {
      // On initial render activeServicesAndProductsTab === 'lb_services' due to redux dispatch
      // Redux dispatch cannot obtain launchdarkly flags to correct so setting here
      activeServicesAndProductsTab =
        activeServicesAndProductsTab === "lb_services"
          ? "laundry_services"
          : activeServicesAndProductsTab;

      if (activeServicesAndProductsTab === servicesAndProductsTabValues.LAUNDRY) {
        activeCategory = "LAUNDRY";
      } else if (
        activeServicesAndProductsTab === servicesAndProductsTabValues.DRY_CLEANING
      ) {
        activeCategory = "DRY_CLEANING";
      } else {
        console.warn("Invalid tab value. Aborting render"); // Rare case - occurs only when a dev makes changes to the tab values
        return;
      }

      const servicesArr = [];

      for (let i = 0; i < services.length; i++) {
        if (services[i].categoryType === activeCategory) {
          for (let j = 0; j < services[i].services.length; j++) {
            services[i].services[j].categoryId = services[i].id;
          }
          servicesArr.push(...services[i].services);
        }
      }

      const sortedServicesArr = sortBy(servicesArr, ["name"]);
      category.services = sortedServicesArr;
    } else {
      if (activeServicesAndProductsTab === servicesAndProductsTabValues.PER_POUND) {
        activeCategory = "PER_POUND";
      } else if (
        activeServicesAndProductsTab === servicesAndProductsTabValues.FIXED_PRICE
      ) {
        activeCategory = "FIXED_PRICE";
      } else {
        console.warn("Invalid tab value. Aborting render"); // Rare case - occurs only when a dev makes changes to the tab values
        return;
      }

      category = services.find((category) => category.category === activeCategory);
    }

    return {category, activeCategory};
  };

  const renderServicesForLocations = () => {
    if (!activeLocationServices) {
      return null;
    }

    const {category, activeCategory} = filterServices();

    if (!category || isEmpty(category.services)) {
      return isServiceCallInProgress ? null : `No services available`;
    }

    let serviceElements = category.services.map((service) => {
      let price = service.prices[0];
      const priceUnit = service?.pricingStructure?.type === "PER_POUND" ? "lb" : "unit";

      let serviceItem = {
        title: service.name,
        minQty: price?.minQty,
        price: price?.storePrice,
        minPrice: price?.minPrice,
        isTaxable: price?.isTaxable,
        isSelected: price?.isFeatured,
        hasMinPrice: service.hasMinPrice,
        isDeliverable: price?.isDeliverable,
        priceUnit: priceUnit,
      };

      return (
        <PriceListItem
          key={`service-${service.id}`}
          item={serviceItem}
          showApplyToAll={false}
          onChange={(field, value, isBlur) => {
            let dataFieldLabel =
              field === "price"
                ? "storePrice"
                : field === "isSelected"
                ? "isFeatured"
                : field;
            let typeCastedValue =
              typeof value === "boolean"
                ? value
                : value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
            handleChange(
              flags.cents20 ? service.categoryId : category.id,
              service.id,
              dataFieldLabel,
              typeCastedValue,
              price.storeId,
              isBlur
            );
          }}
          unselectedMessage={"Not sold in this location"}
          fromLocations
        />
      );
    });

    return (
      <div className="services-section">
        {activeCategory === "FIXED_PRICE" &&
        category?.services?.some((price) =>
          price?.prices?.some((item) => item.isFeatured)
        ) ? (
          <div className="product-fixed-service-headers">
            <span className="bold-text service-header-margin">Price</span>
            <span className="bold-text service-header-margin">Taxable</span>
          </div>
        ) : (
          ""
        )}
        <div className="price-list">{serviceElements}</div>
      </div>
    );
  };

  const renderServicesForPromotions = () => {
    const {servicesList, servicesCallInProgress} = props.promotions;
    if (!servicesList) {
      return null;
    }

    let {category} = filterServices(true);

    if (!category || isEmpty(category.services)) {
      return servicesCallInProgress ? null : `No services available`;
    }

    let serviceElements = category.services.map((service) => {
      let serviceItem = {
        title: service.name,
        isSelected: service.isSelectedForPromotion,
        hasMinPrice: false,
        minPrice: null,
        minQty: null,
        price: "",
        priceUnit: service?.pricingStructure?.type === "PER_POUND" ? "lb" : "unit",
      };

      return (
        <PriceListItem
          key={`service-${service.id}`}
          item={serviceItem}
          showApplyToAll={false}
          onChange={(_field, value) => {
            props.handlePromotionClickInServices(
              value,
              flags.cents20 ? service.categoryId : category.id,
              service.id
            );
          }}
          unselectedMessage={"Not applicable for this promotion"}
          fromPromotions={fromPromotions}
          type="SERVICE"
        />
      );
    });

    return (
      <div className="services-section">
        <div className="price-list">{serviceElements}</div>
      </div>
    );
  };

  return (
    <Fragment>
      {(
        fromPromotions ? props.promotions.servicesCallInProgress : isServiceCallInProgress
      ) ? (
        <BlockingLoader />
      ) : null}

      {!fromPromotions ? (
        <div className="services-buttons-container">
          <Link
            to="/global-settings/products-services/laundry-services"
            className="btn btn-text-only go-to-button"
          >
            Go to my services {">"}
          </Link>

          <p className="service-buttons-error-message">{servicesError}</p>
        </div>
      ) : null}
      {fromPromotions ? (
        <div className="select-all-container-promotions">
          <Checkbox
            checked={props.promotions.selectAllServices}
            onChange={() => {
              props.handleSelectAll(activeServicesAndProductsTab, flags);
            }}
          />
          <button
            className="btn btn-text-only cancel-button"
            onClick={() => {
              props.handleSelectAll(activeServicesAndProductsTab, flags);
            }}
          >
            {props.promotions.selectAllServices ? "Deselect all" : "Select all"}
          </button>
        </div>
      ) : null}
      <div className="services-container" ref={listContainerDivRef}>
        {(
          fromPromotions
            ? props.promotions.servicesListCallError && !props.promotions.servicesList
            : servicesError && !activeLocationServices
        ) ? (
          <p>{fromPromotions ? props.promotions.servicesListCallError : servicesError}</p>
        ) : (
          <Fragment>
            {fromPromotions
              ? renderServicesForPromotions()
              : renderServicesForLocations()}
          </Fragment>
        )}
      </div>
    </Fragment>
  );
};

export default PricePerService;
