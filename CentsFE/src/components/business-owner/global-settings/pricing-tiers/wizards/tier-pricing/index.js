/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useCallback, useRef} from "react";
import {
  fetchServicesOfLocation,
  fetchProductsOfLocation,
} from "../../../../../../api/business-owner/locations";
import get from "lodash/get";
import {isEmpty, cloneDeep} from "lodash";
import {
  TABS,
  CENTS20TABS,
  TIER_PRICING_COPY_OPTIONS,
  SERVICES_TYPE,
} from "../../constants";
import RoundedTabSwitcher from "../../../../../commons/rounder-tab-switcher/rounded-tab-switcher";
import BlockingLoader from "../../../../../commons/blocking-loader/blocking-loader";
import ProductPricingList from "../../../common/product-pricing-list";
import {
  fetchDefaultServicesAndPrices,
  fetchTierPrices,
  editTierProductPrice,
  editTierServicePrice,
} from "../../../../../../api/business-owner/tiers";
import Checkbox from "../../../../../commons/checkbox/checkbox";
import RenderServicesForLocations from "./render-service-prices";
import {Link} from "react-router-dom";
import {useFlags} from "launchdarkly-react-client-sdk";
import {saveNewCategory} from "api/business-owner/products";

const TierPricing = ({
  tierData,
  setTierData,
  setError,
  state,
  dispatch,
  fetchNewServices,
}) => {
  const listContainerDivRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [servicesList, setServicesList] = useState([]);
  const [servicesCopy, setServicesCopy] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [productsCopy, setProductsCopy] = useState([]);
  const [editError, setEditError] = useState(null);

  const [activeRoundedTab, setActiveRoundedTab] = useState(TABS[0].value);

  useEffect(() => {
    setError(null);
    const requiredId = tierData?.locationId || tierData?.tierId;
    if (tierData?.servicesData?.length || tierData?.productsList?.length) {
      setLoading(false);
      setServicesList(tierData?.servicesData);
      setServicesCopy([...JSON.parse(JSON.stringify(tierData?.servicesData || []))]);
      setProductsList(tierData?.productsList);
      setProductsCopy([...JSON.parse(JSON.stringify(tierData?.productsList || []))]);

      return;
    } else {
      if (
        tierData?.tierId ||
        state?.selectedTierId ||
        tierData?.pricingOption === TIER_PRICING_COPY_OPTIONS.newPricing
      ) {
        fetchServicesAndPrices(tierData?.tierId || state?.selectedTierId);
      } else {
        fetchServiceAndProducts(requiredId);
      }
    }

    if (listContainerDivRef.current) {
      listContainerDivRef.current.scrollTop = 0;
    }
  }, [tierData?.locationId, tierData?.pricingOption, tierData?.tierId]);

  useEffect(() => {
    /* 
    1.Checking if atleast one service or product selected every time services or product list changes while tier creation.    
    ToDo
    2.Not Checking while edit because it should be handled from the API, hence added !state?.selectedTierId
    */
    if (!state?.selectedTierId) {
      if (checkIfAtLeastOneServiceOrProductSelected(servicesList, productsList)) {
        setError(null);
      } else {
        !isEmpty(servicesList) &&
          !isEmpty(productsList) &&
          setError("At least one service must be selected to create a pricing tier");
      }
    }
  }, [servicesList, productsList]);

  const fetchServiceAndProducts = useCallback(async (id) => {
    try {
      setLoading(true);
      const servicesResp = await fetchServicesOfLocation(id);
      const productsResp = await fetchProductsOfLocation(id);
      setServicesList(get(servicesResp, "data.services", []));
      setProductsList(get(productsResp, "data.products", []));
      setTierData &&
        setTierData((state) => ({
          ...state,
          servicesData: get(servicesResp, "data.services", []),
          productsList: get(productsResp, "data.products", []),
        }));
    } catch (error) {
      setError(error?.response?.data?.error || "Cannot fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServicesAndPrices = useCallback(async (tierId) => {
    try {
      setLoading(true);
      const resp = tierId
        ? await fetchTierPrices(tierId)
        : await fetchDefaultServicesAndPrices(); //fetching service prices form a tier
      setServicesList(resp?.data?.services || []);
      state?.selectedTierId &&
        setServicesCopy([...JSON.parse(JSON.stringify(resp?.data?.services || []))]); //storing the initial services during the intit to rollaback in case of edit error
      setProductsList(resp?.data?.products || []);
      state?.selectedTierId &&
        setProductsCopy([...JSON.parse(JSON.stringify(resp?.data?.products || []))]); //storing the initial products during the intit to rollaback in case of edit error
      setTierData &&
        setTierData((state) => ({
          ...state,
          servicesData: resp?.data?.services || [],
          productsList: resp?.data?.products || [],
        }));
    } catch (error) {
      setError(error?.response?.data?.error || "Cannot fetch services");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeOfPrices = async (
    categoryId,
    serviceId,
    dataFieldLabel,
    typeCastedValue,
    servicePriceId,
    isBlur //This param can be used for editing prices
  ) => {
    const servicesListCopy = servicesList;
    const categoryIndex = servicesListCopy.findIndex(
      (category) => categoryId === category.id
    );
    const category = servicesListCopy[categoryIndex];
    const serviceIndex = category?.services.findIndex(
      (service) => service.id === serviceId
    );
    const service = category.services[serviceIndex];
    const price = service?.prices[0]; // Assuming exactly one prices comes in this array
    price[dataFieldLabel] = typeCastedValue;
    servicesListCopy[categoryIndex].services[serviceIndex].prices[0] = {
      ...price,
    };

    setServicesList([...servicesListCopy]);
    /*
    1.Make the edit API call if we have selectedTierId in store and after blur
    2.if the edit API fails rollback to the inital services state else update the services list history to the latest state
    */

    if (state?.selectedTierId && isBlur) {
      if (
        !(await editTierPrices({
          serviceId: price?.serviceId,
          field: dataFieldLabel,
          value: typeCastedValue,
          tierId: state?.selectedTierId,
        }))
      ) {
        setServicesList([...JSON.parse(JSON.stringify(servicesCopy))]);
      } else {
        setServicesCopy(JSON.parse(JSON.stringify([...servicesListCopy])));
      }
      return;
    }
    setTierData &&
      setTierData((state) => ({
        ...state,
        servicesData: [...servicesListCopy],
      }));
  };

  const handleOnChangeOfProductPrices = async (product, field, value, isBlur) => {
    const productsListCopy = productsList;
    const productIndex = productsListCopy.findIndex(
      (p) => p.inventoryId === product.inventoryId
    );
    productsListCopy[productIndex] = {...productsList[productIndex], [field]: value};
    setProductsList([...productsListCopy]);
    if (state?.selectedTierId && isBlur) {
      if (
        !(await editTierPrices(
          {
            field,
            value,
            inventoryId: product.inventoryId,
            tierId: state?.selectedTierId,
          },
          SERVICES_TYPE.INVENTORY
        ))
      ) {
        setProductsList([...JSON.parse(JSON.stringify(productsCopy))]);
      } else {
        setProductsCopy(JSON.parse(JSON.stringify([...productsListCopy])));
      }
    }
    setTierData &&
      setTierData((state) => ({
        ...state,
        productsList: [...productsListCopy],
      }));
  };

  const handleChange = (product, field, value, isBlur) => {
    const dataFieldLabel = field === "isSelected" ? "isFeatured" : field;
    const typeCastedValue =
      typeof value === "boolean"
        ? value
        : value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    handleOnChangeOfProductPrices(product, dataFieldLabel, typeCastedValue, isBlur);
  };

  const handleChangeOfActiveTab = (tab) => {
    setActiveRoundedTab(tab);
  };

  const checkIfAllServicesSelected = () => {
    return servicesList[
      servicesList.findIndex((category) => activeRoundedTab === category.category)
    ]?.services.every((service) => service.prices[0]?.isFeatured);
  };

  const checkIfAllProductServicesSelected = () => {
    return productsList.every((service) => service?.isFeatured);
  };

  const handleSelectAllProductServices = (val) => () => {
    const updatedProductsCopy = productsList;
    productsList.map((item, index) => {
      const service = item; // Assuming exactly one prices comes in this array
      service.isFeatured = val;

      updatedProductsCopy[index] = {...service};
    });
    setProductsList([...updatedProductsCopy]);
    setTierData((state) => ({
      ...state,
      productsList: [...updatedProductsCopy],
    }));
  };

  const handleSelectAllServices = (val) => () => {
    const servicesListCopy = servicesList;
    const categoryIndex = servicesListCopy.findIndex(
      (category) => activeRoundedTab === category.category
    );
    const category = servicesListCopy[categoryIndex];
    category.services.map((service, i) => {
      const price = service?.prices[0]; // Assuming exactly one prices comes in this array
      price["isFeatured"] = val;
      servicesListCopy[categoryIndex].services[i].prices[0] = {
        ...price,
      };
    });
    setServicesList([...servicesListCopy]);
    setTierData((state) => ({
      ...state,
      servicesData: [...servicesListCopy],
    }));
  };

  const getSelectionText = () => {
    return (activeRoundedTab === SERVICES_TYPE.INVENTORY &&
      checkIfAllProductServicesSelected()) ||
      checkIfAllServicesSelected()
      ? "Deselect all"
      : "Select all";
  };

  const checkIfTabHasServices = () => {
    const servicesListCopy =
      activeRoundedTab === SERVICES_TYPE.INVENTORY ? productsList : servicesList;
    if (
      activeRoundedTab === SERVICES_TYPE.PER_POUND ||
      activeRoundedTab === SERVICES_TYPE.FIXED_PRICE
    ) {
      const categoryIndex = servicesListCopy.findIndex(
        (category) => activeRoundedTab === category.category
      );
      if (categoryIndex === -1) {
        return false;
      }
      return !servicesListCopy[categoryIndex]?.length;
    }

    return !!servicesListCopy?.length;
  };

  const editTierPrices = async (payload, type) => {
    try {
      setEditError(null);
      dispatch({
        type: "SET_EDIT_LOADER",
        payload: true,
      });
      let response =
        type === SERVICES_TYPE.INVENTORY
          ? await editTierProductPrice(payload)
          : await editTierServicePrice(payload);

      return response?.data?.success;
    } catch (error) {
      setEditError(error?.response?.data?.error || "Cannot edit service price");
      return false;
    } finally {
      dispatch({
        type: "SET_EDIT_LOADER",
        payload: false,
      });
    }
  };

  const checkIfAtLeastOneServiceOrProductSelected = (services, products) => {
    return !services
      .map((e) => e.services)
      .flat()
      .every((service) => !service.prices[0]?.isFeatured);
  };

  return (
    <div className="pricing-container">
      {loading || state?.tierDetailsLoader ? <BlockingLoader /> : null}
      {!state?.selectedTierId ? (
        <div className="pricing-header">
          <p className="new-pricing-header">
            Please select and set the pricing for the services
          </p>
          <p className="new-pricing-header">and products you would like in this tier:</p>
        </div>
      ) : null}
      <div className="prices-tab-container">
        <RoundedTabSwitcher
          className="price-services-categories"
          roundedTabs={TABS}
          setActiveRoundedTab={handleChangeOfActiveTab}
          activeRoundedTab={activeRoundedTab}
        />
      </div>
      {servicesList.length > 0 &&
        productsList.length > 0 &&
        checkIfTabHasServices() &&
        !state?.selectedTierId && (
          <div className="select-all-container-tiers">
            <Checkbox
              checked={
                activeRoundedTab === SERVICES_TYPE.INVENTORY
                  ? checkIfAllProductServicesSelected()
                  : checkIfAllServicesSelected()
              }
              onChange={
                activeRoundedTab === SERVICES_TYPE.INVENTORY
                  ? handleSelectAllProductServices(!checkIfAllProductServicesSelected())
                  : handleSelectAllServices(!checkIfAllServicesSelected())
              }
            />

            <button
              className="btn btn-text-only cancel-button"
              onClick={
                activeRoundedTab === SERVICES_TYPE.INVENTORY
                  ? handleSelectAllProductServices(!checkIfAllProductServicesSelected())
                  : handleSelectAllServices(!checkIfAllServicesSelected())
              }
            >
              {getSelectionText()}
            </button>
          </div>
        )}
      {activeRoundedTab === SERVICES_TYPE.PER_POUND ||
      activeRoundedTab === SERVICES_TYPE.FIXED_PRICE ? (
        <div className="tier-services-pricing" ref={listContainerDivRef}>
          <RenderServicesForLocations
            activeRoundedTab={activeRoundedTab}
            servicesList={servicesList}
            loading={loading}
            handleChangeOfPrices={handleChangeOfPrices}
            selectedTierId={state?.selectedTierId}
            isPricingTierScreen
          />
        </div>
      ) : (
        <div className="tier-services-pricing" ref={listContainerDivRef}>
          <ProductPricingList
            error={null}
            items={productsList
              ?.filter((product) => !product.isDeleted)
              .map((product) => {
                return {
                  title: product.productName,
                  isSelected: product.isFeatured,
                  price: product.price,
                  quantity: product.quantity,
                  priceUnit: "unit",
                  imageUrl: product.productImage,
                  ...product,
                };
              })}
            unselectedMessage={"Not available for this tier"}
            nullDescription={
              state?.selectedTierId ? (
                <p className="services-empty-text">
                  No products have been created. Please add products
                  <Link to={"/global-settings/products-services/products"}> here</Link>.
                </p>
              ) : (
                <div className={"services-empty-container"}>
                  <p className="services-empty-text">
                    Please add{" "}
                    <Link to={"/global-settings/products-services/products"}>
                      products
                    </Link>{" "}
                    before you set up the tier.
                  </p>
                </div>
              )
            }
            handleChange={handleChange}
            keyExtractor={(product) =>
              `product-${product.inventoryId}-${product.storeId}`
            }
            showTaxable={false}
            showQuantity={false}
            hideHeaders
          />
        </div>
      )}
      {editError && (
        <div className={"tier-edit-error-container"}>
          <p className={"error-message"}>{editError}</p>
        </div>
      )}
    </div>
  );
};

const TierPricing20 = ({
  tierData,
  setTierData,
  setError,
  state,
  dispatch,
  fetchNewServices,
}) => {
  const listContainerDivRef = useRef(null);
  const flags = useFlags();
  const [loading, setLoading] = useState(true);
  const [servicesList, setServicesList] = useState([]);
  const [servicesCopy, setServicesCopy] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [productsCopy, setProductsCopy] = useState([]);
  const [editError, setEditError] = useState(null);

  const [activeRoundedTab, setActiveRoundedTab] = useState(CENTS20TABS[0].value);

  useEffect(() => {
    setError(null);

    const requiredId = tierData?.locationId || tierData?.tierId;
    if (tierData?.servicesData?.length || tierData?.productsList?.length) {
      setLoading(false);

      setServicesList(tierData?.servicesData);
      setServicesCopy(cloneDeep(tierData?.servicesData || []));

      setProductsList(tierData?.productsList);
      return setProductsCopy(cloneDeep(tierData?.productsList || []));
    } else {
      if (
        tierData?.tierId ||
        state?.selectedTierId ||
        tierData?.pricingOption === TIER_PRICING_COPY_OPTIONS.newPricing
      ) {
        fetchServicesAndPrices(tierData?.tierId || state?.selectedTierId);
      } else {
        fetchServiceAndProducts(requiredId);
      }
    }

    if (listContainerDivRef.current) {
      listContainerDivRef.current.scrollTop = 0;
    }
  }, [tierData?.locationId, tierData?.pricingOption, tierData?.tierId]);

  useEffect(() => {
    /* 
    1.Checking if atleast one service or product selected every time services or product list changes while tier creation.    
    ToDo
    2.Not Checking while edit because it should be handled from the API, hence added !state?.selectedTierId
    */
    if (!state?.selectedTierId) {
      if (checkIfAtLeastOneServiceOrProductSelected(servicesList, productsList)) {
        setError(null);
      } else {
        // If nothing is selected, throw an error
        if (!isEmpty(servicesList) && !isEmpty(productsList)) {
          setError("At least one service must be selected to create a pricing tier");
        }
      }
    }
  }, [servicesList, productsList]);

  const fetchServiceAndProducts = useCallback(async (id) => {
    try {
      setLoading(true);
      const servicesResp = await fetchServicesOfLocation(id);
      const productsResp = await fetchProductsOfLocation(id);
      setServicesList(get(servicesResp, "data.services", []));
      setProductsList(get(productsResp, "data.products", []));
      setTierData &&
        setTierData((state) => ({
          ...state,
          servicesData: get(servicesResp, "data.services", []),
          productsList: get(productsResp, "data.products", []),
        }));
    } catch (error) {
      setError(error?.response?.data?.error || "Cannot fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServicesAndPrices = useCallback(async (tierId) => {
    try {
      setLoading(true);
      const resp = tierId
        ? await fetchTierPrices(tierId)
        : await fetchDefaultServicesAndPrices(); //fetching service prices form a tier

      setServicesList(resp?.data?.services || []);
      setProductsList(resp?.data?.products || []);

      if (state?.selectedTierId) {
        //storing the initial services during the intit to rollaback in case of edit error
        setServicesCopy(cloneDeep(resp?.data?.services || []));
        //storing the initial products during the intit to rollaback in case of edit error
        setProductsCopy(cloneDeep(resp?.data?.products) || []);
      }

      setTierData &&
        setTierData((state) => ({
          ...state,
          servicesData: resp?.data?.services || [],
          productsList: resp?.data?.products || [],
        }));
    } catch (error) {
      setError(error?.response?.data?.error || "Cannot fetch services");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeOfPrices = async (
    categoryId,
    serviceId,
    dataFieldLabel,
    typeCastedValue,
    serviceIdOnPrice,
    isBlur //This param can be used for editing prices
  ) => {
    const servicesListCopy = servicesList;
    const categoryIndex = servicesListCopy.findIndex(
      (category) => categoryId === category.id
    );
    const category = servicesListCopy[categoryIndex];
    const serviceIndex = category?.services.findIndex(
      (service) => service.id === serviceId
    );
    const service = category.services[serviceIndex];
    const price = service?.prices[0]; // Assuming exactly one prices comes in this array
    price[dataFieldLabel] = typeCastedValue;
    servicesListCopy[categoryIndex].services[serviceIndex].prices[0] = {
      ...price,
    };

    setServicesList([...servicesListCopy]);
    /*
    1.Make the edit API call if we have selectedTierId in store and after blur
    2.if the edit API fails rollback to the inital services state else update the services list history to the latest state
    */

    if (state?.selectedTierId && isBlur) {
      if (
        !(await editTierPrices({
          serviceId: serviceIdOnPrice,
          field: dataFieldLabel,
          value: typeCastedValue,
          tierId: state?.selectedTierId,
        }))
      ) {
        setServicesList([...JSON.parse(JSON.stringify(servicesCopy))]);
      } else {
        setServicesCopy(JSON.parse(JSON.stringify([...servicesListCopy])));
      }
      return;
    }
    setTierData &&
      setTierData((state) => ({
        ...state,
        servicesData: [...servicesListCopy],
      }));
  };

  const handleOnChangeOfProductPrices = async (product, field, value, isBlur) => {
    const productsListCopy = productsList;
    const productIndex = productsListCopy.findIndex(
      (p) => p.inventoryId === product.inventoryId
    );
    productsListCopy[productIndex] = {...productsList[productIndex], [field]: value};
    setProductsList([...productsListCopy]);
    if (state?.selectedTierId && isBlur) {
      if (
        !(await editTierPrices(
          {
            field,
            value,
            inventoryId: product.inventoryId,
            tierId: state?.selectedTierId,
          },
          SERVICES_TYPE.INVENTORY
        ))
      ) {
        setProductsList([...JSON.parse(JSON.stringify(productsCopy))]);
      } else {
        setProductsCopy(JSON.parse(JSON.stringify([...productsListCopy])));
      }
    }
    setTierData &&
      setTierData((state) => ({
        ...state,
        productsList: [...productsListCopy],
      }));
  };

  const handleChange = (product, field, value, isBlur) => {
    const dataFieldLabel = field === "isSelected" ? "isFeatured" : field;
    const typeCastedValue =
      typeof value === "boolean"
        ? value
        : value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    handleOnChangeOfProductPrices(product, dataFieldLabel, typeCastedValue, isBlur);
  };

  const handleChangeOfActiveTab = (tab) => {
    setActiveRoundedTab(tab);
  };

  const checkIfAllServicesSelected = () => {
    if (
      activeRoundedTab === SERVICES_TYPE.LAUNDRY ||
      activeRoundedTab === SERVICES_TYPE.DRY_CLEANING
    ) {
      // If a service is not selected immediately break out and return false
      // Else return true
      for (let i = 0; i < servicesList.length; i++) {
        if (servicesList[i].categoryType === activeRoundedTab) {
          for (let j = 0; j < servicesList[i].services.length; j++) {
            if (!servicesList[i].services[j].prices[0]?.isFeatured) {
              return false;
            }
          }
        }
      }
      return true;
    }
  };

  const checkIfAllProductsSelected = () => {
    return productsList.every((service) => service?.isFeatured);
  };

  const handleSelectAllProducts = (val) => () => {
    const updatedProductsCopy = productsList;
    productsList.map((item, index) => {
      const service = item; // Assuming exactly one price comes in this array
      service.isFeatured = val;

      updatedProductsCopy[index] = {...service};
    });
    setProductsList([...updatedProductsCopy]);
    setTierData((state) => ({
      ...state,
      productsList: [...updatedProductsCopy],
    }));
  };

  const handleSelectAllServices = (val) => () => {
    const servicesListCopy = cloneDeep(servicesList);

    for (let i = 0; i < servicesListCopy.length; i++) {
      if (servicesListCopy[i].categoryType === activeRoundedTab) {
        for (let j = 0; j < servicesListCopy[i].services.length; j++) {
          servicesListCopy[i].services[j].prices[0].isFeatured = val;
        }
      }
    }

    setServicesList([...servicesListCopy]);
    setTierData((state) => ({
      ...state,
      servicesData: [...servicesListCopy],
    }));
  };

  const getSelectionText = () => {
    return (activeRoundedTab === SERVICES_TYPE.INVENTORY &&
      checkIfAllProductsSelected()) ||
      checkIfAllServicesSelected()
      ? "Deselect all"
      : "Select all";
  };

  const checkIfTabHasServices = () => {
    const selectedServices =
      activeRoundedTab === SERVICES_TYPE.INVENTORY ? productsList : servicesList;

    return !!selectedServices?.length;
  };

  const editTierPrices = async (payload, type) => {
    try {
      setEditError(null);
      dispatch({
        type: "SET_EDIT_LOADER",
        payload: true,
      });
      let response =
        type === SERVICES_TYPE.INVENTORY
          ? await editTierProductPrice(payload)
          : await editTierServicePrice(payload);

      return response?.data?.success;
    } catch (error) {
      setEditError(error?.response?.data?.error || "Cannot edit service price");
      return false;
    } finally {
      dispatch({
        type: "SET_EDIT_LOADER",
        payload: false,
      });
    }
  };

  const checkIfAtLeastOneServiceOrProductSelected = (services, products) => {
    return !services
      .map((e) => e.services)
      .flat()
      .every((service) => !service.prices[0]?.isFeatured);
  };

  return (
    <div className="pricing-container">
      {loading || state?.tierDetailsLoader ? <BlockingLoader /> : null}
      {!state?.selectedTierId ? (
        <div className="pricing-header">
          <p className="new-pricing-header">
            Please select and set the pricing for the services
          </p>
          <p className="new-pricing-header">and products you would like in this tier:</p>
        </div>
      ) : null}
      <div className="prices-tab-container">
        <RoundedTabSwitcher
          className="price-services-categories"
          roundedTabs={flags.cents20 ? CENTS20TABS : TABS}
          setActiveRoundedTab={handleChangeOfActiveTab}
          activeRoundedTab={activeRoundedTab}
        />
      </div>
      {servicesList.length > 0 &&
        productsList.length > 0 &&
        checkIfTabHasServices() &&
        !state?.selectedTierId && (
          <div className="select-all-container-tiers">
            <Checkbox
              checked={
                activeRoundedTab === SERVICES_TYPE.INVENTORY
                  ? checkIfAllProductsSelected()
                  : checkIfAllServicesSelected()
              }
              onChange={
                activeRoundedTab === SERVICES_TYPE.INVENTORY
                  ? handleSelectAllProducts(!checkIfAllProductsSelected())
                  : handleSelectAllServices(!checkIfAllServicesSelected())
              }
            />

            <button
              className="btn btn-text-only cancel-button"
              onClick={
                activeRoundedTab === SERVICES_TYPE.INVENTORY
                  ? handleSelectAllProducts(!checkIfAllProductsSelected())
                  : handleSelectAllServices(!checkIfAllServicesSelected())
              }
            >
              {getSelectionText()}
            </button>
          </div>
        )}
      {activeRoundedTab === SERVICES_TYPE.LAUNDRY ||
      activeRoundedTab === SERVICES_TYPE.DRY_CLEANING ? (
        <div className="tier-services-pricing" ref={listContainerDivRef}>
          <RenderServicesForLocations
            activeRoundedTab={activeRoundedTab}
            servicesList={servicesList}
            loading={loading}
            handleChangeOfPrices={handleChangeOfPrices}
            selectedTierId={state?.selectedTierId}
            isPricingTierScreen
          />
        </div>
      ) : (
        <div className="tier-services-pricing" ref={listContainerDivRef}>
          <ProductPricingList
            error={null}
            items={productsList
              ?.filter((product) => !product.isDeleted)
              .map((product) => {
                return {
                  title: product.productName,
                  isSelected: product.isFeatured,
                  price: product.price,
                  quantity: product.quantity,
                  priceUnit: "unit",
                  imageUrl: product.productImage,
                  ...product,
                };
              })}
            unselectedMessage={"Not available for this tier"}
            nullDescription={
              state?.selectedTierId ? (
                <p className="services-empty-text">
                  No products have been created. Please add products
                  <Link to={"/global-settings/products-services/products"}> here</Link>.
                </p>
              ) : (
                <div className={"services-empty-container"}>
                  <p className="services-empty-text">
                    Please add{" "}
                    <Link to={"/global-settings/products-services/products"}>
                      products
                    </Link>{" "}
                    before you set up the tier.
                  </p>
                </div>
              )
            }
            handleChange={handleChange}
            keyExtractor={(product) =>
              `product-${product.inventoryId}-${product.storeId}`
            }
            showTaxable={false}
            showQuantity={false}
            hideHeaders
          />
        </div>
      )}
      {editError && (
        <div className={"tier-edit-error-container"}>
          <p className={"error-message"}>{editError}</p>
        </div>
      )}
    </div>
  );
};

export {TierPricing, TierPricing20};
