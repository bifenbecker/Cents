/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useCallback} from "react";
import {
  fetchTierPrices,
  editTierOnlineOrderServices,
} from "../../../../../api/business-owner/tiers";
import EditStep from "../../locations/common/edit-step/edit-step";
import AddEditOnlineOrderServices from "./add-edit-online-order-services";
import ServiceDisableErrorPopup from "../../locations/general-delivery-settings/service-disable-error-popup";
import isEqual from "lodash/isEqual";
import sortBy from "lodash/sortBy";
import {toDollars} from "../../locations/utils/location";

const EditTierWizard = (props) => {
  const {state, dispatch} = props;
  const {
    selectedTierId,
    tierDetails,
    editTierDetailsLoader,
    editTierDetailsError,
  } = state;
  const [tierData, setTierData] = useState({});
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const filterByCategory = (service, serviceCategory) => {
    let selectedServicePriceIds = [];
    const availableServicePriceIds = (
      service?.find(({category}) => category === serviceCategory) || {
        services: [],
      }
    )?.services?.map((services) => {
      const {id, name, hasMinPrice, prices} = services;
      const {isDeliverable, storePrice} = prices?.length === 1 ? prices?.[0] : [];
      if (isDeliverable) {
        selectedServicePriceIds.push({
          label: name || "",
          value: prices?.length ? prices?.[0]?.id : id,
          metaInfo: `(${hasMinPrice ? "min + " : ""}${toDollars(storePrice)} / ${
            serviceCategory === "PER_POUND" ? "lb" : "unit"
          })`,
        });
      }
      return {...services, id: prices?.length ? prices?.[0]?.id : id};
    });
    return {
      selectedServicePricesID: selectedServicePriceIds,
      optionServicePricesID: {
        category: serviceCategory,
        services: availableServicePriceIds,
      },
    };
  };

  const groupedServiceOptions = (servicesAPI) => {
    const perPoundServices = filterByCategory(servicesAPI, "PER_POUND");
    const fixedPriceServices = filterByCategory(servicesAPI, "FIXED_PRICE");
    setTierData((state) => ({
      ...state,
      servicesData: [
        perPoundServices?.optionServicePricesID || {},
        fixedPriceServices?.optionServicePricesID || {},
      ],
      onlineOrderServices: [
        ...perPoundServices?.selectedServicePricesID,
        ...fixedPriceServices?.selectedServicePricesID,
      ],
      previouslySelectedServices: [
        ...perPoundServices?.selectedServicePricesID,
        ...(fixedPriceServices?.selectedServicePricesID || []),
      ],
    }));
  };

  const fetchServicesAndPrices = useCallback(
    async (tierId) => {
      try {
        dispatch({
          type: "SET_EDIT_TIER_ERROR",
          payload: "",
        });
        dispatch({
          type: "TOGGLE_EDIT_TIER_LOADER",
          payload: true,
        });
        const response = tierId ? await fetchTierPrices(tierId) : null; //fetching service prices form a tier
        groupedServiceOptions(response?.data?.services);
      } catch (error) {
        dispatch({
          type: "SET_EDIT_TIER_ERROR",
          payload: error?.response?.data?.error || "Cannot fetch services",
        });
      } finally {
        dispatch({
          type: "TOGGLE_EDIT_TIER_LOADER",
          payload: false,
        });
      }
    },
    [dispatch]
  );

  const onSubmitEditTierOnlineOrderServices = async () => {
    try {
      dispatch({
        type: "SET_EDIT_TIER_ERROR",
        payload: "",
      });
      dispatch({
        type: "TOGGLE_EDIT_TIER_LOADER",
        payload: true,
      });

      const deliverableData =
        tierData?.onlineOrderServices?.map(({value}) => {
          return {
            id: value,
            isDeliverable: true,
          };
        }) || [];

      const previouslySelectedOnlineOrderServices = tierData?.previouslySelectedServices.map(
        (service) => {
          let filterData = deliverableData?.filter((data) => data.id === service.value);
          if (filterData?.length) {
            return null;
          } else {
            return {
              id: service.value,
              isDeliverable: false,
            };
          }
        }
      );

      const notDeliverableData = previouslySelectedOnlineOrderServices?.filter(
        (data) => data !== null
      );

      const payload = {
        prices: [...deliverableData, ...notDeliverableData],
      };
      await editTierOnlineOrderServices(payload, state?.selectedTierId);
      dispatch({
        type: "TOGGLE_EDIT_TIER_WIZARD",
        payload: false,
      });
    } catch (err) {
      if (err?.response?.data?.type === "ACTIVE_SUBSCRIPTIONS") {
        setShowConfirmationPopup(true);
        setTierData((state) => ({
          ...state,
          onlineOrderServices: tierData?.previouslySelectedServices,
        }));
      } else
        dispatch({
          type: "SET_EDIT_TIER_ERROR",
          payload:
            err?.response?.data.error ||
            "Could not update online order services. Please try again later!",
        });
    } finally {
      dispatch({
        type: "TOGGLE_EDIT_TIER_LOADER",
        payload: false,
      });
    }
  };

  const closeEditTierScreen = () => {
    dispatch({
      type: "TOGGLE_EDIT_TIER_WIZARD",
      payload: false,
    });
  };

  useEffect(() => {
    if (selectedTierId) {
      fetchServicesAndPrices(selectedTierId);
    }
  }, [fetchServicesAndPrices, selectedTierId, tierDetails.deliverableServicePrices]);

  const handleDisableSave = () => {
    return (
      tierData?.onlineOrderServices?.includes(null) ||
      isEqual(
        sortBy(tierData?.onlineOrderServices, ["value"]),
        sortBy(tierData?.previouslySelectedServices, ["value"])
      )
    );
  };

  return (
    <EditStep
      header="Online Ordering"
      onCancel={closeEditTierScreen}
      onSubmit={onSubmitEditTierOnlineOrderServices}
      isSaveDisabled={handleDisableSave()}
      isLoading={editTierDetailsLoader}
      errorMessage={editTierDetailsError}
    >
      {showConfirmationPopup && (
        <ServiceDisableErrorPopup setShowConfirmationPopup={setShowConfirmationPopup} />
      )}

      {!editTierDetailsLoader ? (
        <AddEditOnlineOrderServices
          setTierData={setTierData}
          tierData={tierData}
          state={state}
          dispatch={dispatch}
        />
      ) : (
        <p className="tier-edit-loading-msg-container">Loading...</p>
      )}
    </EditStep>
  );
};

export default EditTierWizard;
