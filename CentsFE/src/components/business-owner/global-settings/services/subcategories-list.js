import React from "react";
import {sortBy} from "lodash";
import Checkbox from "../../../commons/checkbox/checkbox";
import PropTypes from "prop-types";
import cx from "classnames";

const SubcategoriesList = ({
  servicesListError,
  servicesList,
  servicesCategories,
  category,
  getAllServicesCallInProgress,
  flags,
  activeServiceId,
  setActiveService,
  generatePricing,
}) => {
  if (servicesListError) {
    return (
      <div className="service-item-list">
        <div key={"error-item"} className={`common-list-item`}>
          <p className="error-message">{servicesListError}</p>
        </div>
      </div>
    );
  }

  if (servicesList.length === 0) {
    return null;
  }

  if (!servicesCategories || (category.length === 0 && !getAllServicesCallInProgress)) {
    return (
      <div className="service-item-list">
        <div key="No items to show" className="common-list-item">
          <p>No Laundry Services yet. Click the '+' icon to start adding.</p>
        </div>
      </div>
    );
  }

  let subcategories = [];
  let hasServices = [];
  let noServices = [];
  let washAndFold = {};

  servicesList.forEach((item) => {
    if (item.category !== "PER_POUND") {
      item?.services?.length === 0 ? noServices.push(item) : hasServices.push(item);
    } else {
      washAndFold.id = item.id;
      washAndFold.category = "Wash & Fold";
      washAndFold.businessId = item.businessId;
      washAndFold.createdAt = item.createdAt;
      washAndFold.services = item.services;
      washAndFold.deletedAt = item.deletedAt;
      washAndFold.serviceCategoryTypeId = item.serviceCategoryTypeId;
      washAndFold.imageUrl = item.imageUrl;
      washAndFold.turnAroundInHours = item.turnAroundInHours;
      washAndFold.updatedAt = item.updatedAt;
      washAndFold.isDeleted = item.isDeleted;
    }
  });

  hasServices = sortBy(hasServices, (o) => o?.category.toLowerCase());
  noServices = sortBy(noServices, (o) => o?.category.toLowerCase());
  subcategories = hasServices.concat(noServices);
  subcategories.unshift(washAndFold);

  return (
    <>
      <div className="drycleaning-services-container">
        {subcategories.map((item, idx) => {
          return (
            category.includes(item.category) && (
              <div key={`${item}_${idx}`}>
                <p className="drycleaning-services-container category-title">
                  {item.category}
                </p>
                <div className="service-item-list">
                  {item.services.map((subcategory) => {
                    if (flags.cents20) {
                      return (
                        <div
                          key={subcategory.id}
                          className={cx("common-list-item", {
                            active: activeServiceId === subcategory.id,
                          })}
                          onClick={() => {
                            setActiveService(subcategory.id);
                          }}
                        >
                          <Checkbox checked={activeServiceId === subcategory.id} />
                          <p className="text-item">{subcategory.name}</p>
                          {generatePricing(subcategory)}
                          {subcategory.isDeleted && (
                            <span className="archived-tag archived-tag__services">
                              ARCHIVED
                            </span>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={subcategory.id}
                          className={cx("common-list-item", {
                            active: activeServiceId === subcategory.id,
                          })}
                          onClick={() => {
                            setActiveService(subcategory.id);
                          }}
                        >
                          <Checkbox checked={activeServiceId === subcategory.id} />
                          <p className="text-item">{subcategory.name}</p>
                          {subcategory?.pricingStructure?.type === "FIXED_PRICE" ? (
                            <p className="service-item-dollar-amount text-item">
                              {`${
                                subcategory.defaultPrice
                                  ? `$${subcategory.defaultPrice.toFixed(2)}`
                                  : "$0.00"
                              } / unit`}
                            </p>
                          ) : (
                            <p className="service-item-dollar-amount text-item">
                              {`${
                                subcategory.defaultPrice
                                  ? `$${subcategory.defaultPrice.toFixed(2)}`
                                  : "$0.00"
                              } / lb`}
                            </p>
                          )}
                          {subcategory.isDeleted && (
                            <span className="archived-tag archived-tag__services">
                              ARCHIVED
                            </span>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )
          );
        })}
      </div>
    </>
  );
};

SubcategoriesList.propTypes = {
  servicesListError: PropTypes.string,
  servicesList: PropTypes.array,
  servicesCategories: PropTypes.array,
  category: PropTypes.object,
  getAllServicesCallInProgress: PropTypes.func,
  flags: PropTypes.object,
  activeServiceId: PropTypes.number,
  setActiveService: PropTypes.func,
  generatePricing: PropTypes.func,
};

export default SubcategoriesList;
