import React from "react";
import SearchResults from "./search-results";
import SubcategoriesList from "./subcategories-list";
import PropTypes from "prop-types";

const LeftPaneContent = ({
  searchInProgress,
  searchText,
  servicesList,
  activeServiceId,
  setActiveService,
  servicesListError,
  getAllServicesCallInProgress,
  servicesCategories,
  category,
  flags,
  generatePricing,
  servicesSearchResults,
}) => {
  return searchInProgress ? (
    <SearchResults
      flags={flags}
      searchText={searchText}
      servicesList={servicesList}
      activeServiceId={activeServiceId}
      setActiveService={setActiveService}
      servicesSearchResults={servicesSearchResults}
      generatePricing={generatePricing}
    />
  ) : (
    <SubcategoriesList
      servicesListError={servicesListError}
      servicesList={servicesList}
      servicesCategories={servicesCategories}
      category={category}
      getAllServicesCallInProgress={getAllServicesCallInProgress}
      flags={flags}
      activeServiceId={activeServiceId}
      setActiveService={setActiveService}
      generatePricing={generatePricing}
    />
  );
};

LeftPaneContent.propTypes = {
  searchInProgress: PropTypes.bool,
  searchText: PropTypes.string,
  servicesList: PropTypes.array,
  servicesCategoryList: PropTypes.array,
  activeServiceId: PropTypes.number,
  setActiveService: PropTypes.func,
  servicesListError: PropTypes.string,
  getAllServicesCallInProgress: PropTypes.func,
  servicesCategories: PropTypes.array,
  category: PropTypes.object,
  flags: PropTypes.object,
  generatePricing: PropTypes.func,
  servicesSearchResults: PropTypes.object,
};

export default LeftPaneContent;
