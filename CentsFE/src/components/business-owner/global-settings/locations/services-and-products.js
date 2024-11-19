import React, {useEffect} from "react";

import RoundedTabSwitcher from "../../../commons/rounder-tab-switcher/rounded-tab-switcher";

// Location
import PricePerService from "../../../../containers/bo-locations-price-per-service";
import PricePerProduct from "./price-per-product";

// Wizard
import PricePerServiceForPromotion from "../../../../containers/bo-promotions-price-per-service";
import PricePerProductForPromotion from "../../../../containers/bo-promotions-price-per-product";

import {servicesAndProductsTabValues} from "../../../../constants";

import {useFlags} from "launchdarkly-react-client-sdk";

const tabs = [
  {
    value: servicesAndProductsTabValues.PER_POUND,
    label: "/Lb Services",
  },
  {
    value: servicesAndProductsTabValues.FIXED_PRICE,
    label: "Fixed Price Services",
  },
  {
    value: servicesAndProductsTabValues.PRODUCTS,
    label: "Products",
  },
];

const cents20tabs = [
  {
    value: servicesAndProductsTabValues.LAUNDRY,
    label: "Laundry",
  },
  {
    value: servicesAndProductsTabValues.DRY_CLEANING,
    label: "Dry Cleaning",
  },
  {
    value: servicesAndProductsTabValues.PRODUCTS,
    label: "Products",
  },
];

const ServicesAndProducts = (props) => {
  const flags = useFlags();
  const handleUnMount = props.handleUnMount;
  const {fromPromotions, isDetails, resetPromotionsServiceProducts} = props;

  useEffect(() => {
    return () => {
      // On Unmount - clean up
      handleUnMount();
      if (isDetails) {
        resetPromotionsServiceProducts && resetPromotionsServiceProducts();
      }
    };
  }, [handleUnMount, isDetails, resetPromotionsServiceProducts]);

  const render_content = (activeTab) => {
    switch (activeTab) {
      case servicesAndProductsTabValues.LAUNDRY:
      case servicesAndProductsTabValues.DRY_CLEANING:
      case servicesAndProductsTabValues.FIXED_PRICE:
      case servicesAndProductsTabValues.PER_POUND:
        return fromPromotions ? (
          <PricePerServiceForPromotion
            fromPromotions={fromPromotions}
            isDetails={isDetails}
          />
        ) : (
          <PricePerService />
        );
      case servicesAndProductsTabValues.PRODUCTS:
        return fromPromotions ? (
          <PricePerProductForPromotion
            fromPromotions={fromPromotions}
            isDetails={isDetails}
          />
        ) : (
          <PricePerProduct />
        );
      default:
        return null;
    }
  };

  return (
    <div className="products-and-services-container">
      <RoundedTabSwitcher
        className="products-and-services-tab-switcher"
        roundedTabs={flags.cents20 ? cents20tabs : tabs}
        setActiveRoundedTab={(tab) => {
          props.handleTabChange(tab);
        }}
        activeRoundedTab={
          flags.cents20 && props.activeServicesAndProductsTab === "lb_services"
            ? servicesAndProductsTabValues.LAUNDRY
            : props.activeServicesAndProductsTab
        }
      />
      <div
        className={`products-and-services-content ${props.activeServicesAndProductsTab}`}
      >
        {flags.cents20 && props.activeServicesAndProductsTab === "lb_services"
          ? render_content(servicesAndProductsTabValues.LAUNDRY)
          : render_content(props.activeServicesAndProductsTab)}
      </div>
    </div>
  );
};

export default ServicesAndProducts;
