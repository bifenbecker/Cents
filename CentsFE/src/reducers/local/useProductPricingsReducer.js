import {useReducer} from "react";
import {
  applyProductPriceToLocations,
  updateProductPrices,
} from "../../api/business-owner/products";

const putProductPrice = async ({
  inventoryId,
  storeId,
  field,
  value,
  dispatch,
  afterProductSave,
}) => {
  try {
    dispatch({type: "EDITING"});
    let resp = await updateProductPrices(inventoryId, storeId, field, value);
    dispatch({type: "EDITING_SUCCESS"});
    if (afterProductSave) afterProductSave(resp?.data?.record);
  } catch (e) {
    dispatch({
      type: "EDITING_ERROR",
      payload: {
        error: e?.response?.data?.error || `Failed to update ${field}`,
      },
    });
    setTimeout(() => {
      dispatch({type: "REMOVE_EDITING_ERROR"});
    }, 3000);
  }
};

export const handleChangeFactory = ({dispatch, afterProductSave}) => async (
  item,
  field,
  value,
  shouldSubmit
) => {
  const {inventoryId, storeId} = item;

  if (field === "isSelected") {
    field = "isFeatured";
  }
  if (!["isTaxable", "isFeatured"].includes(field)) {
    value = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"); // Allowing only numbers and .
    value = value.substring(0, 5); // Limiting the length to 5 chars
  }

  dispatch({type: "UPDATE_FIELD", payload: {inventoryId, storeId, field, value}});

  if (shouldSubmit) {
    await putProductPrice({
      inventoryId,
      storeId,
      field,
      value,
      afterProductSave,
      dispatch,
    });
  }
};

export const handleApplyAll = async ({productId, items, dispatch}) => {
  try {
    dispatch({type: "EDITING"});
    const {price, isTaxable} = items[0] || {};
    const inventoryItemIds = items.filter(({isFeatured}) => isFeatured).map(({id}) => id);
    const payload = {
      price: {storePrice: price, isTaxable},
      inventoryItemIds,
    };

    await applyProductPriceToLocations(productId, payload);
    dispatch({type: "ON_APPLY_ALL_SUCCESS", payload});
  } catch (e) {
    dispatch({
      type: "EDITING_ERROR",
      payload: {
        error: e?.response?.data?.error || "Failed to update prices",
      },
    });
    setTimeout(() => {
      dispatch({type: "REMOVE_EDITING_ERROR"});
    }, 3000);
  }
};

const updateItemsField = (state, {inventoryId, storeId, field, value}) => {
  const newState = {...state};
  const itemIndex = newState.items.findIndex(
    (item) => item.inventoryId === inventoryId && item.storeId === storeId
  );
  newState.items[itemIndex] = {
    ...newState.items[itemIndex],
    [field]: value,
  };
  return newState;
};

const reducerFunction = (state, action) => {
  switch (action.type) {
    case "ITEMS_FETCHING":
      return {...state, itemsLoading: true};
    case "ITEMS_FETCH_FAILURE":
      return {...state, itemsLoading: false, itemsFetchError: action?.payload};
    case "ITEMS_FETCH_SUCCESS":
    case "INIT_ITEMS":
      return {
        ...state,
        items: action?.payload?.length ? JSON.parse(JSON.stringify(action.payload)) : [],
        duplicateItems: action?.payload?.length
          ? JSON.parse(JSON.stringify(action.payload))
          : [],
        itemsLoading: false,
        itemsFetchError: null,
      };
    case "UPDATE_FIELD":
      return updateItemsField(state, action.payload || {});
    case "EDITING":
      return {
        ...state,
        editLoading: true,
        editError: null,
      };
    case "EDITING_SUCCESS":
      return {
        ...state,
        duplicateItems: JSON.parse(JSON.stringify(state.items)),
        editLoading: false,
      };
    case "EDITING_ERROR":
      return {
        ...state,
        items: JSON.parse(JSON.stringify(state.duplicateItems)),
        editError: action.payload?.error,
        editLoading: false,
      };
    case "REMOVE_EDITING_ERROR":
      return {
        ...state,
        editError: null,
      };
    case "ON_APPLY_ALL_SUCCESS":
      let {items} = state;
      const {
        price: {storePrice: price, isTaxable},
        inventoryItemIds,
      } = action.payload || {};

      const updatedInventoryItems = items.map((item) =>
        inventoryItemIds.includes(item.id)
          ? {
              ...item,
              price,
              isTaxable,
            }
          : {...item}
      );

      return {
        ...state,
        items: updatedInventoryItems,
        duplicateItems: JSON.parse(JSON.stringify(updatedInventoryItems)),
        editLoading: false,
        editError: "",
      };
    default:
      return state;
  }
};

const useProductPricingsReducer = () => {
  const [state, dispatch] = useReducer(reducerFunction, {
    items: [],
    duplicateItems: [],
    itemsLoading: false,
    itemsFetchError: null,
    editLoading: false,
    editError: null,
  });

  return {
    state,
    dispatch,
  };
};

export default useProductPricingsReducer;
