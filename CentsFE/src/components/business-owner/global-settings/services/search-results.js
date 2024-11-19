import React from "react";
import Checkbox from "../../../commons/checkbox/checkbox";
import PropTypes from "prop-types";
import cx from "classnames";

const SearchResults = ({
  flags,
  searchText,
  servicesList,
  activeServiceId,
  setActiveService,
  servicesSearchResults,
  generatePricing,
}) => {
  const condition = flags.cents20
    ? searchText && servicesList.length !== 0
    : searchText &&
      (servicesList?.categories[0]?.services.length !== 0 ||
        servicesList?.categories[1]?.services.length !== 0);

  if (condition) {
    const searchResults = flags.cents20
      ? servicesSearchResults
      : [...servicesList.categories[0].services, ...servicesList.categories[1].services];
    return (
      <div className="service-item-list search-results">
        {searchResults.map((service) => {
          return (
            <div
              key={service.id}
              className={cx("common-list-item", {
                active: activeServiceId === service.id,
              })}
              onClick={() => {
                setActiveService(service.id);
              }}
            >
              <Checkbox checked={activeServiceId === service.id} />
              <p className="service-item-type">{service.name}</p>
              <p className="service-item-dollar-amount"></p>
              {generatePricing(service)}
              {service.isDeleted && (
                <span className="archived-tag archived-tag__services">ARCHIVED</span>
              )}
            </div>
          );
        })}
      </div>
    );
  } else {
    return (
      <div className="service-item-list search-results">
        <div className="common-list-item">
          <p style={{fontStyle: "italic"}}>No Search Results.</p>
        </div>
      </div>
    );
  }
};

SearchResults.propTypes = {
  flags: PropTypes.object,
  searchText: PropTypes.string,
  servicesList: PropTypes.array,
  activeServiceId: PropTypes.number,
  setActiveService: PropTypes.func,
  servicesSearchResults: PropTypes.object,
  generatePricing: PropTypes.func,
};

export default SearchResults;
