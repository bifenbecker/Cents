// Package Imports
import React, {useEffect, useState, useCallback} from "react";
import {sortBy} from "lodash";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../../../commons/checkbox/checkbox";
import imagePlaceholderIcon from "../../../../assets/images/Icon_Image_Placeholder.svg";
import categoryIcon from "../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import exitIcon from "../../../../assets/images/Icon_Exit_Side_Panel.svg";

// Components Import
import Card from "../../../commons/card/card";
import TabLayout from "../products-and-services-tab-layout/products-services-tab-layout";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import SearchBar from "../../../commons/expandable-search-bar/expandable-search-bar";
import DropdownMultiSelect from "../../../commons/multi-select-with-input/multi-select-with-input";

//Container Import
import ProductWizard from "../../../../containers/bo-products-wizard";
import ProductDetails from "../../../../containers/bo-product-details";
import ProductsPricePerLocation from "./products-price-per-location";
import InactiveFiltersButton from "../../../../assets/images/Icon_Filter.svg";
import {PopoverBody, UncontrolledPopover} from "reactstrap";

//LaunchDarkly
import {useFlags} from "launchdarkly-react-client-sdk";

const Products = ({
  handleProductSearch,
  setActiveProductId,
  fetchAllProductsList,
  showHideNewProductWizard,
  setSearchInProgress,
  productCategories,
  productsList,
  productsListError,
  activeProductId,
  searchText,
  activeTab,
  searchInProgress,
  showNewProductWizard,
  tabs,
  setActiveTab,
  productInventoryStatus,
  showNewCategoryScreenInDetails,
  showNewProductsPricingScreen,
  handleShowNewCategoryScreenInDetails,
  productsListCallInProgress,
  newCategoryError,
  handleShowNewProductsPricingScreen,
  createNewCategory,
}) => {
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);
  const [category, setCategory] = useState([]);
  const [sortedCategories, setSortedCategories] = useState([]);
  let sortedCategoryList = [];
  const flags = useFlags();

  const handleSearch = (searchInput, includeArchived) => {
    handleProductSearch(searchInput, includeArchived);
  };

  const handleSetActiveProductId = useCallback(
    (productId) => {
      setActiveProductId(productId);
    },
    [setActiveProductId]
  );

  useEffect(() => {
    fetchAllProductsList({withArchived: showArchivedTasks});

    return () => {
      handleSearch("", false);
      showHideNewProductWizard(false);
      setSearchInProgress(false);
    };
  }, [showArchivedTasks]); // eslint-disable-line react-hooks/exhaustive-deps

  const [newCategory, setNewCategory] = useState("");
  const handleNewCategory = (newCategoryName) => {
    setNewCategory(newCategoryName.trim());
  };
  const options = [
    ...productCategories?.map((item) => ({
      label: item.name,
      value: item.name,
      id: item.id,
    })),
  ];

  const initializeCategoryState = useCallback(() => {
    let categoriesWithoutItems = [];
    let categoriesWithItems = [];
    let categoryIdsWithProducts;
    if (productsList) {
      categoryIdsWithProducts = productsList.map((item) => item.categoryId);
    }
    if (productCategories) {
      productCategories.map((category) => {
        if (categoryIdsWithProducts.includes(category.id)) {
          categoriesWithItems.push(category);
        } else {
          categoriesWithoutItems.push(category);
        }
      });
      categoriesWithoutItems = sortBy(categoriesWithoutItems, (o) =>
        o.name.toLowerCase()
      );
      categoriesWithItems = sortBy(categoriesWithItems, (o) => o.name.toLowerCase());
      sortedCategoryList = categoriesWithItems.concat(categoriesWithoutItems);
      setSortedCategories(sortedCategoryList);
      setCategory(sortedCategoryList.map((item) => item.name));
    }
  }, [productCategories, productsList]);

  useEffect(() => {
    flags.cents20 && initializeCategoryState();
  }, [flags.cents20, initializeCategoryState]);

  const renderLegacyProductsList = () => {
    if (productsListError) {
      return (
        <div className="product-list">
          <div className="common-list-item">
            <p className="error-message">{productsListError}</p>
          </div>
        </div>
      );
    }

    if (!productsList) {
      return (
        <div className="product-list">
          <div className="common-list-item">
            <p>Products loading...</p>
          </div>
        </div>
      );
    }

    if (productsList.length === 0) {
      return (
        <div className="product-list">
          <div className="common-list-item">
            <p>No products yet. Click the '+' icon to start adding.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="product-list">
        {productsList.map((product) => (
          <div
            key={`product-${product.id}`}
            className={`common-list-item ${
              activeProductId === product.id ? "active" : ""
            }`}
            onClick={() => handleSetActiveProductId(product.id)}
          >
            <div className={"product-list-label"}>
              <Checkbox checked={activeProductId === product.id} />
              <div className="product-image-container">
                <img src={product.productImage || imagePlaceholderIcon} alt="product" />
              </div>
              <p className="product-name">{product.productName}</p>
            </div>
            {product.isDeleted && <span className="archived-tag">ARCHIVED</span>}
          </div>
        ))}
      </div>
    );
  };

  const renderProductsList = () => {
    if (productsListError) {
      return (
        <div className="product-list">
          <div className="common-list-item">
            <p className="error-message">{productsListError}</p>
          </div>
        </div>
      );
    }

    if (!productsList) {
      return (
        <div className="product-list">
          <div className="common-list-item">
            <p>Products loading...</p>
          </div>
        </div>
      );
    }

    if (productsList.length === 0) {
      return (
        <div className="product-list">
          <div className="common-list-item">
            <p>No products yet. Click the '+' icon to start adding.</p>
          </div>
        </div>
      );
    }
    let productList = productsList;

    return (
      <>
        {sortedCategories.map((item, idx) => {
          return (
            category.includes(item.name) && (
              <div key={`${item}_${idx}`}>
                <p className="drycleaning-services-container category-title">
                  {item.name}
                </p>
                <div className="product-list">
                  {productList
                    .filter((product) => {
                      return product.categoryId === item.id;
                    })
                    .map((product) => (
                      <div
                        key={`product-${product.id}`}
                        className={`common-list-item ${
                          activeProductId === product.id ? "active" : ""
                        }`}
                        onClick={() => handleSetActiveProductId(product.id)}
                      >
                        <div className={"product-list-label"}>
                          <Checkbox checked={activeProductId === product.id} />
                          <div className="product-image-container">
                            <img
                              src={product.productImage || imagePlaceholderIcon}
                              alt="product"
                            />
                          </div>
                          <p className="text-item">{product.productName}</p>
                        </div>
                        {product.isDeleted && (
                          <span className="archived-tag">ARCHIVED</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )
          );
        })}
      </>
    );
  };

  const renderSearchResults = () => {
    if (searchText && productsList.length !== 0) {
      const searchResults = [...productsList];
      return (
        <div className="product-list">
          {searchResults.map((product) => (
            <div
              key={`product-${product.id}`}
              className={`common-list-item ${
                activeProductId === product.id ? "active" : ""
              }`}
              onClick={() => {
                setActiveProductId(product.id);
              }}
            >
              <Checkbox checked={activeProductId === product.id} />
              <div className="product-image-container">
                <img src={product.productImage || imagePlaceholderIcon} alt="product" />
              </div>
              <p className="product-name">{product.productName}</p>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="product-list">
          <div key={"No product search results"} className={`common-list-item`}>
            <p style={{fontStyle: "italic"}}>{`No Search Results.`}</p>
          </div>
        </div>
      );
    }
  };

  const renderActiveComponent = () => {
    if (activeTab === "details") {
      return <ProductDetails />;
    } else if (activeTab === "locationPricing") {
      return <ProductsPricePerLocation />;
    }
  };

  const renderLeftPaneContent = () => {
    if (searchInProgress) return renderSearchResults();
    else return flags.cents20 ? renderProductsList() : renderLegacyProductsList();
  };

  const archiveProduct = async (id, archiveBoolean) => {
    await archiveProduct(id, archiveBoolean);
    await fetchAllProductsList({withArchived: showArchivedTasks});
  };

  const renderRightPaneContent = () => {
    if (searchInProgress) {
      if (searchText === "" || productsList.length === 0) {
        return (
          <div className="no-search-results">
            <p>No Search Results</p>
          </div>
        );
      }
    }

    if (showNewProductWizard)
      return (
        <ProductWizard
          showHideNewProductWizard={showHideNewProductWizard}
          showArchivedTasks={showArchivedTasks}
        />
      );
    return (
      <TabLayout
        tabs={tabs}
        activeTab={activeTab}
        activeComponent={renderActiveComponent()}
        onTabClick={setActiveTab}
        status={productInventoryStatus}
        archiveProduct={archiveProduct}
        product={productsList?.find((product) => product.id === activeProductId)}
      />
    );
  };

  const handleButtonDisable = () => {
    if (!showNewCategoryScreenInDetails) return false;
    else return newCategory.trim().length ? false : true;
  };

  const renderNewCategoryScreen = () => {
    return (
      <div
        className={`product-wizard-main-container ${
          showNewProductsPricingScreen && "flex-reset"
        }`}
      >
        <div className="product-wizard-exit-icon-container">
          <img
            src={exitIcon}
            alt=""
            onClick={() => {
              handleShowNewCategoryScreenInDetails(false);
            }}
          />
        </div>
        <p className="product-wizard-heading"> Add New Sub-Category</p>
        <div className="product-wizard-form-container">
          <div className="product-wizard-form-input">
            <img src={categoryIcon} alt="" />
            <input
              type="text"
              name="newCategory"
              placeholder="Sub-Category Name"
              onChange={(evt) => handleNewCategory(evt.target.value)}
              maxLength="50"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div className={"bo-global-settings-content-2-column-layout"}>
        <div className={"bo-global-settings-content-left-column"}>
          <div className="locations-card-container">
            <div className="locations-card-header">
              <p>Products</p>
              <div className="filter-button">
                <img id="archive-filters-icon" src={InactiveFiltersButton} />
                <UncontrolledPopover
                  trigger="legacy"
                  placement="bottom-end"
                  target="archive-filters-icon"
                  isOpen={showFiltersPopover}
                  toggle={() => setShowFiltersPopover(!showFiltersPopover)}
                >
                  <PopoverBody>FILTERS</PopoverBody>
                  <PopoverBody>
                    <span>Show archived</span>
                    <Checkbox
                      checked={showArchivedTasks}
                      onChange={() => {
                        if (showFiltersPopover) {
                          setShowFiltersPopover(!showFiltersPopover);
                          setShowArchivedTasks(!showArchivedTasks);
                        }
                      }}
                    />
                  </PopoverBody>
                </UncontrolledPopover>
              </div>
              <FontAwesomeIcon
                icon={faPlus}
                onClick={() => {
                  handleSearch("", false);
                  setSearchInProgress(false);
                  showHideNewProductWizard(true);
                }}
                className="products-plus-button"
              />
            </div>
            {flags.cents20 ? (
              <div className="services-tab-search-container">
                <DropdownMultiSelect
                  label={category.length === 0 ? "All Sub-Categories" : ""}
                  itemName={category.length === 1 ? "Sub-Category" : "Sub-Categories"}
                  allItemsLabel="All Sub-Categories"
                  options={options}
                  value={category}
                  onChange={setCategory}
                  categoryIcon={true}
                  className="dropdown.multi-select-with-input dropdown-menu.show dropdown-closed"
                />
                <SearchBar
                  setSearchInProgress={setSearchInProgress}
                  searchInProgress={searchInProgress}
                  handleSearch={handleSearch}
                  includeArchived={showArchivedTasks}
                  value={searchText}
                />
              </div>
            ) : (
              <SearchBar
                setSearchInProgress={setSearchInProgress}
                searchInProgress={searchInProgress}
                handleSearch={handleSearch}
                includeArchived={showArchivedTasks}
                value={searchText}
              />
            )}
            <div className="locations-card-content">{renderLeftPaneContent()}</div>
            {productsListCallInProgress && <BlockingLoader />}
          </div>
        </div>
        <div className={"bo-global-settings-content-right-column"}>
          <div className={"locations-card-container info-card-container"}>
            {showNewCategoryScreenInDetails ? (
              <>
                {renderNewCategoryScreen()}
                <div className="service-prices-footer">
                  <p className="service-footer-error-message">{newCategoryError} </p>
                  <button
                    className="btn btn-text-only cancel-button"
                    onClick={() => {
                      if (showNewCategoryScreenInDetails) {
                        handleShowNewCategoryScreenInDetails(false);
                      } else {
                        showHideNewProductWizard(false);
                        handleShowNewProductsPricingScreen(false);
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-rounded btn-theme"
                    disabled={handleButtonDisable()}
                    onClick={() => createNewCategory(newCategory)}
                  >
                    {"SAVE"}
                  </button>
                </div>
              </>
            ) : (
              renderRightPaneContent()
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Products;
