import {createSlice} from "@reduxjs/toolkit";

import {FETCHING_STATUS} from "constants/api";
import {cloneOrderState} from "../constants";
import {ONLINE_ORDER_REDUCER} from "./constants/general";
import initialData from "./constants/initData";
import {
  deleteCustomerAddressInfo,
  getCustomerInfo,
  patchAddressInfo,
  getOrderInitialData,
  getCustomerSubscriptionsList,
  getServiceTypesAvailability,
  getReturnWindows,
  getNearStores,
} from "./thunks";

const onlineOrderSlice = createSlice({
  name: ONLINE_ORDER_REDUCER,
  initialState: initialData,
  reducers: {
    setSelectedServices: (state, action) => {
      state.schedule.selectedServices = action.payload;
    },
    setPickupInfo: (state, action) => {
      state.schedule.pickup = action.payload;
    },
    setPickupDayIndex: (state, action) => {
      state.schedule.pickupDayIndex = action.payload;
    },
    setReturnDayIndex: (state, action) => {
      state.schedule.returnDayIndex = action.payload;
    },
    setReturnInfo: (state, action) => {
      state.schedule.returnInfo = action.payload;
    },
    setStage: (state, action) => {
      state.schedule.currentStage = action.payload;
    },
    setDeliveryDetails: (state, action) => {
      state.deliveryProviders = action.payload;
    },
    setServiceTypeSelection: (state, action) => {
      const {
        laundryTurnaround,
        categoryTurnaround,
        dryCleaningTurnaround,
        hasDryCleaning,
        hasLaundry,
      } = action.payload;

      state.turnAroundTimeForCategories.data.dryCleaningTurnaroundTime =
        laundryTurnaround;
      state.turnAroundTimeForCategories.data.turnAroundInHours = categoryTurnaround;
      state.turnAroundTimeForCategories.data.dryCleaningTurnaroundTime =
        dryCleaningTurnaround;

      state.serviceTypeAvailability.data.hasDryCleaning = hasDryCleaning;
      state.serviceTypeAvailability.data.hasLaundry = hasLaundry;
    },
    setCloneOrderData: (state, action) => {
      const {
        returnMethod,
        servicePriceId,
        serviceModifierIds,
        customerNotes,
        orderNotes,
        bagCount,
      } = action.payload;

      state.newOrderConfig.cloneOrderType = cloneOrderState.EDIT;
      state.newOrderConfig.returnMethod = returnMethod;
      state.newOrderConfig.servicePriceId = servicePriceId;
      state.newOrderConfig.serviceModifierIds = serviceModifierIds;
      state.newOrderConfig.customerNotes = customerNotes;
      state.newOrderConfig.orderNotes = orderNotes;
      state.newOrderConfig.bagCount = bagCount;
    },
    deleteAddress: (state, action) => {
      const addresses = state.customerInfo.data.addresses;
      state.customerInfo.data.addresses = addresses.filter(
        (address) => address.id !== action.payload
      );
    },
    setCurrentAddress: (state, action) => {
      state.currentCustomerAddress = action.payload;
    },
    setLastSuccessfullyCheckedAddress: (state, action) => {
      state.lastSuccessfullyCheckAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReturnWindows.pending, (state) => {
        state.returnWindows.fetchingStatus = FETCHING_STATUS.PENDING;
      })
      .addCase(getReturnWindows.fulfilled, (state, action) => {
        state.returnWindows.fetchingStatus = FETCHING_STATUS.FULFILLED;
        state.returnWindows.data = action.payload;
      })
      .addCase(getReturnWindows.rejected, (state, action) => {
        const {error} = action;
        state.returnWindows.fetchingStatus = FETCHING_STATUS.REJECTED;
        state.returnWindows.error = {
          text: error.message,
          code: error.name,
        };
      })
      .addCase(getOrderInitialData.pending, (state) => {
        state.initialOrderData.fetchingStatus = FETCHING_STATUS.PENDING;
      })
      .addCase(getOrderInitialData.fulfilled, (state, action) => {
        state.initialOrderData.fetchingStatus = FETCHING_STATUS.FULFILLED;
        state.initialOrderData.data = action.payload;
        state.currentCustomerAddress = action.payload.customerAddress;
      })
      .addCase(getOrderInitialData.rejected, (state, action) => {
        const {error} = action;
        state.initialOrderData.fetchingStatus = FETCHING_STATUS.REJECTED;
        state.initialOrderData.error = {
          text: error.message,
          code: error.name,
        };
      })
      .addCase(getCustomerInfo.pending, (state) => {
        state.customerInfo.fetchingStatus = FETCHING_STATUS.PENDING;
      })
      .addCase(getCustomerInfo.fulfilled, (state, action) => {
        state.customerInfo.fetchingStatus = FETCHING_STATUS.FULFILLED;
        state.customerInfo.data = action.payload;
      })
      .addCase(getCustomerInfo.rejected, (state, action) => {
        const {error} = action;
        state.customerInfo.fetchingStatus = FETCHING_STATUS.REJECTED;
        state.customerInfo.error = {
          text: error.message,
          code: error.name,
        };
      })
      .addCase(patchAddressInfo.pending, (state) => {
        state.customerInfo.fetchingStatus = FETCHING_STATUS.PENDING;
      })
      .addCase(patchAddressInfo.fulfilled, (state, action) => {
        (state.selectedAddress = state.currentAddress),
          (state.customerInfo.fetchingStatus = FETCHING_STATUS.FULFILLED);
        state.customerInfo.data.addresses =
          state.response.customerInfo.data.addresses.map((element) => {
            if (element.id === action.payload.id) {
              element = action.payload;
            }
            return element;
          });
      })
      .addCase(patchAddressInfo.rejected, (state, action) => {
        const {error} = action;
        state.customerInfo.fetchingStatus = FETCHING_STATUS.REJECTED;
        state.customerInfo.error = {
          text: error.message,
          code: error.name,
        };
      })
      .addCase(deleteCustomerAddressInfo.pending, (state) => {
        state.customerInfo.fetchingStatus = FETCHING_STATUS.PENDING;
      })
      .addCase(deleteCustomerAddressInfo.fulfilled, (state, action) => {
        state.customerInfo.fetchingStatus = FETCHING_STATUS.FULFILLED;
        const addresses = state.customerInfo.data.addresses;
        state.customerInfo.data.addresses = addresses.filter(
          (address) => address.id !== action.payload.deletedAddress.id
        );
      })
      .addCase(deleteCustomerAddressInfo.rejected, (state, action) => {
        const {error} = action;

        state.customerInfo.fetchingStatus = FETCHING_STATUS.REJECTED;
        state.customerInfo.error = {
          text: error.message,
          code: error.name,
        };
      })
      .addCase(getCustomerSubscriptionsList.pending, (state) => {
        state.initialOrderData.fetchingStatus = FETCHING_STATUS.PENDING;
      })
      .addCase(getCustomerSubscriptionsList.fulfilled, (state, action) => {
        state.initialOrderData.data.subscriptions = action.payload;
        state.initialOrderData.fetchingStatus = FETCHING_STATUS.FULFILLED;
      })
      .addCase(getCustomerSubscriptionsList.rejected, (state, action) => {
        const {error} = action;
        state.initialOrderData.fetchingStatus = FETCHING_STATUS.REJECTED;
        state.initialOrderData.error = {
          text: error.message,
          code: error.name,
        };
      })
      .addCase(getServiceTypesAvailability.pending, (state) => {
        state.serviceTypeAvailability.fetchingStatus = FETCHING_STATUS.PENDING;
      })
      .addCase(getServiceTypesAvailability.fulfilled, (state, action) => {
        state.serviceTypeAvailability.fetchingStatus = FETCHING_STATUS.FULFILLED;
        state.serviceTypeAvailability.data.offersDryCleaning =
          action.payload.hasDryCleaning;
        state.serviceTypeAvailability.data.offersLaundry = action.payload.hasLaundry;
      })
      .addCase(getServiceTypesAvailability.rejected, (state, action) => {
        const {error} = action;
        state.serviceTypeAvailability.fetchingStatus = FETCHING_STATUS.REJECTED;
        state.serviceTypeAvailability.error = {
          text: error.message,
          code: error.name,
        };
      })
      .addCase(getNearStores.pending, (state) => {
        state.nearStoresData.fetchingStatus = FETCHING_STATUS.PENDING;
      })
      .addCase(getNearStores.fulfilled, (state, action) => {
        state.nearStoresData.fetchingStatus = FETCHING_STATUS.FULFILLED;
        state.nearStoresData.data = action.payload;
      })
      .addCase(getNearStores.rejected, (state, action) => {
        const {error} = action;
        state.nearStoresData.fetchingStatus = FETCHING_STATUS.REJECTED;
        state.nearStoresData.error = {
          text: error.message,
          code: error.name,
        };
      });
  },
});

export const onlineOrderActions = onlineOrderSlice.actions;
export const onlineOrderReducer = onlineOrderSlice.reducer;
