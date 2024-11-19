import React, {Fragment, useEffect, useRef} from "react";
import {useSelector} from "react-redux";

import * as locationsApi from "../../../../api/business-owner/locations";
import useProductPricingsReducer, {
  handleChangeFactory,
} from "../../../../reducers/local/useProductPricingsReducer";

import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import ProductPricingList from "../common/product-pricing-list";

const fetchProductsOfLocation = async (locationId, dispatch) => {
  try {
    dispatch({type: "ITEMS_FETCHING"});
    let resp = await locationsApi.fetchProductsOfLocation(locationId);
    dispatch({
      type: "ITEMS_FETCH_SUCCESS",
      payload: resp?.data?.products || [],
    });
  } catch (e) {
    dispatch({
      type: "ITEMS_FETCH_FAILURE",
      payload: e?.response?.data?.error || e?.message,
    });
  }
};

const PricePerProduct = (props) => {
  const {fromPromotions, fetchProductsList, handleProductsTabSwitch, isDetails} = props;

  const selectedLocationId = useSelector(
    (state) => state?.businessOwner?.globalSettings?.locations?.selectedLocation?.id
  );

  const {
    state: {
      items: locationProducts,
      itemsLoading: locationProductsLoading,
      itemsFetchError: locationProductsError,
      editError,
      editLoading,
    },
    dispatch: locationProductsDispatch,
  } = useProductPricingsReducer();
  const mounted = useRef(false);

  const handleChange = handleChangeFactory({dispatch: locationProductsDispatch});

  // Did mount
  useEffect(() => {
    // to ensure not to make API calls when anything else changes
    if (!mounted.current) {
      if (fromPromotions) {
        fetchProductsList(isDetails);
        if (props.promotions?.productsList?.length !== 0) handleProductsTabSwitch();
      } else if (selectedLocationId) {
        fetchProductsOfLocation(selectedLocationId, locationProductsDispatch);
      } else {
        locationProductsDispatch({
          type: "ITEMS_FETCH_FAILURE",
          payload: "Selected Location not available",
        });
      }
    }
  }, [
    fetchProductsList,
    fromPromotions,
    handleProductsTabSwitch,
    isDetails,
    locationProductsDispatch,
    props.promotions,
    selectedLocationId,
  ]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <Fragment>
      {(
        fromPromotions ? props.promotions.productsCallInProgress : locationProductsLoading
      ) ? (
        <BlockingLoader />
      ) : null}

      <ProductPricingList
        error={
          (
            fromPromotions
              ? !props.promotions.productsList && props.promotions.productsListCallError
              : !locationProducts?.length && locationProductsError
          )
            ? fromPromotions
              ? props.promotions.productsListCallError
              : locationProductsError
            : null
        }
        items={
          fromPromotions
            ? props.promotions.productsList
                .filter((product) => !product.isDeleted)
                .map((product) => {
                  return {
                    title: product.productName,
                    isSelected: product.isSelectedForPromotion,
                    price:
                      product.prices.length === 0
                        ? `$${product.prices[0]} /unit`
                        : `${product.prices.length} prices`,
                    imageUrl: product.productImage,
                    ...product,
                  };
                })
            : locationProducts
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
                })
        }
        unselectedMessage={
          fromPromotions
            ? "Not applicable for this promotion"
            : "Not sold in this location"
        }
        nullDescription="No products available"
        handleChange={(product, field, value, isBlur) => {
          if (fromPromotions) {
            props.handlePromotionClickInProducts(value, product.inventoryId);
          } else {
            handleChange({...product, storeId: selectedLocationId}, field, value, isBlur);
          }
        }}
        showImage={fromPromotions}
        keyExtractor={(product) => `product-${product.inventoryId}-${product.storeId}`}
        fromPromotions={fromPromotions}
        showSelectAll={fromPromotions}
        handleSelectAll={props.handleSelectAll}
        editLoading={editLoading}
        editError={editError}
        showProductsScreenLink
      />
    </Fragment>
  );
};

export default PricePerProduct;
