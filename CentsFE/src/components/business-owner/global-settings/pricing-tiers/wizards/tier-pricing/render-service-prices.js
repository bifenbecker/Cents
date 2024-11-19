import React from "react";
import {Link} from "react-router-dom";
import {isEmpty, sortBy} from "lodash";
import PriceListItem from "../../../price-list-item";
import {SERVICES_TYPE, PRICE_UNIT} from "../../constants";
import {useFlags} from "launchdarkly-react-client-sdk";

const RenderServicesForLocations = ({
  activeRoundedTab,
  servicesList,
  loading,
  handleChangeOfPrices,
  selectedTierId,
  isPricingTierScreen,
}) => {
  const flags = useFlags();
  if (!servicesList) {
    return null;
  }

  let category = {};

  if (flags.cents20) {
    const servicesArr = [];

    for (let i = 0; i < servicesList.length; i++) {
      if (servicesList[i].categoryType === activeRoundedTab) {
        for (let j = 0; j < servicesList[i].services.length; j++) {
          servicesList[i].services[j].categoryId = servicesList[i].id;
        }
        servicesArr.push(...servicesList[i].services);
      }
    }

    const sortedServicesArr = sortBy(servicesArr, ["name"]);
    category.services = sortedServicesArr;
  } else {
    category = servicesList.find((category) => category.category === activeRoundedTab);
  }

  if (!category || isEmpty(category) || !category.services.length) {
    return loading ? null : (
      <div className={"services-empty-container"}>
        {selectedTierId ? (
          <p className="services-empty-text">
            No services have been created. Please add services
            <Link to={"/global-settings/products-services/laundry-services"}> here</Link>.
          </p>
        ) : (
          <p className="services-empty-text">
            Please add{" "}
            <Link to={"/global-settings/products-services/laundry-services"}>
              services
            </Link>{" "}
            before you set up the tier.
          </p>
        )}
      </div>
    );
  }

  const serviceElements = category.services.map((service) => {
    const price = service?.prices[0];
    const priceUnit = flags.cents20
      ? service.pricingStructure?.type === SERVICES_TYPE.PER_POUND
        ? PRICE_UNIT.lb
        : PRICE_UNIT.unit
      : category?.category === SERVICES_TYPE.PER_POUND
      ? PRICE_UNIT.lb
      : PRICE_UNIT.unit;

    const serviceItem = {
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
    const onChange = (field, value, isBlur) => {
      const dataFieldLabel =
        field === "price" ? "storePrice" : field === "isSelected" ? "isFeatured" : field;
      const typeCastedValue =
        typeof value === "boolean"
          ? value
          : value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
      handleChangeOfPrices(
        flags.cents20 ? service.categoryId : category.id,
        service.id,
        dataFieldLabel,
        typeCastedValue,
        price.serviceId,
        isBlur
      );
    };
    return (
      <PriceListItem
        key={`services-${service.id}`}
        item={serviceItem}
        showApplyToAll={false}
        onChange={onChange}
        unselectedMessage={"Not available for this tier"}
        showTaxable={false}
        enableSelectionForAllServices={!selectedTierId}
        isPricingTierScreen={isPricingTierScreen}
      />
    );
  });
  return (
    <div className="services-section">
      <div className="price-list">{serviceElements}</div>
    </div>
  );
};

export default RenderServicesForLocations;
