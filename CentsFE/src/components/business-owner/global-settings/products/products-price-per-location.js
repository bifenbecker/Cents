import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

import actionTypes from "../../../../actionTypes";
import {createNamespacer} from "../../../../utils/reducers";
import useProductPricingsReducer, {
  handleChangeFactory,
  handleApplyAll,
} from "../../../../reducers/local/useProductPricingsReducer";

import ProductPricingList from "../common/product-pricing-list";

const productsAT = actionTypes.businessOwner.globalSettings.products;
const productsNamespacer = createNamespacer("BO-PRODUCTS");

const ProductsPricePerLocation = () => {
  const {
    activeProductDetails,
    productDetailsError,
    productsListError,
    isProductDetailsLoading,
    productsListCallInProgress,
    productDetailsNullDescription,
  } = useSelector((state) => state.businessOwner.globalSettings.products);
  const globalDispatch = useDispatch();

  const {state, dispatch} = useProductPricingsReducer();

  useEffect(() => {
    dispatch({
      type: "INIT_ITEMS",
      payload: activeProductDetails.inventoryItems,
    });
  }, [activeProductDetails.inventoryItems, dispatch]);

  const afterProductSave = (updatedRecord) => {
    globalDispatch({
      type: productsNamespacer(productsAT.UPDATE_INVENTORY_ITEM_AND_STATUS),
      payload: updatedRecord,
    });
  };

  const onApplyAll = () =>
    handleApplyAll({productId: activeProductDetails.id, items: state?.items, dispatch});

  const items = state?.items?.map((storeItem) => {
    return {
      ...storeItem,
      title: storeItem.store?.name,
      price: storeItem.price,
      quantity: storeItem.quantity,
      isSelected: storeItem.isFeatured,
      isTaxable: storeItem.isTaxable,
    };
  });

  return (
    <ProductPricingList
      error={productDetailsError || productsListError}
      items={items}
      loading={isProductDetailsLoading || productsListCallInProgress}
      editLoading={state?.editLoading}
      editError={state?.editError}
      unselectedMessage="Not featured in this location"
      nullDescription={productDetailsNullDescription}
      handleChange={handleChangeFactory({afterProductSave, dispatch})}
      keyExtractor={(item) => `price-item-${item.storeId}-${item.inventoryId}`}
      canApplyAll
      onApplyAll={onApplyAll}
    />
  );
};

export default ProductsPricePerLocation;
