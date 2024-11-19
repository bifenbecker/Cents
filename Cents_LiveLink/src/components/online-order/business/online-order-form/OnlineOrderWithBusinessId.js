import React, {useCallback, useEffect, useState} from "react";
import {toast} from "react-toastify";
import {useHistory, useParams} from "react-router-dom";
import {useHookstate} from "@hookstate/core";
import get from "lodash/get";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

import {cloneOrderState, orderPickUpSteps} from "../../constants";
import {onlineOrderState} from "../../../../state/online-order";
import {
  fetchCustomerInfo,
  fetchGeneralDeliverySettings,
  fetchOnDemandDeliverySettings,
  fetchOwnDriverDeliverySettings,
  fetchServicesAndModifiers,
} from "../../../../api/online-order";
import {fetchSubscriptions} from "../../../../api/subscriptions";
import useIsDoorDashServiceable from "../../../../hooks/api/useIsDoordashServiceable";

import OrderDetails from "./order-details";
import FinishingUp from "./finishing-up";
import {WithTheme} from "../../../common";
import ToastError from "../../../common/ToastError";
import {businessSettingsSelectors} from "../../../../features/business/redux";
import {useAppSelector} from "app/hooks";

const OrderPickupForm = ({businessId, ...props}) => {
  const cloneOrderType = props?.location?.state;
  const history = useHistory();
  const {businessId: encodedBusinessId} = useParams();

  const businessSettings = useAppSelector(
    businessSettingsSelectors.getBusinessSettingsFromRedux
  );
  const [currentStep, setCurrentStep] = useState(orderPickUpSteps.details);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState();
  const [customerInfo, setCustomerInfo] = useState();
  const [generalDeliverySettings, setGeneralDeliverySettings] = useState();
  const [onDemandDeliverySettings, setOnDemandDeliverySettings] = useState();
  const [ownDriverDeliverySettings, setOwnDriverDeliverySettings] = useState();
  const [ownDeliverySettingsLoading, setOwnDeliverySettingsLoading] = useState();
  const [subscriptions, setSubscriptions] = useState([]);

  const {loading: checkingOnDemandServiceability, isDoorDashServiceable} =
    useIsDoorDashServiceable();
  const {
    customerAddressInfo: {postalCode},
  } = useHookstate(onlineOrderState).value;
  const storeId = useHookstate(onlineOrderState.storeId);
  const onlineOrderBusinessId = useHookstate(onlineOrderState.businessId);

  useEffect(() => {
    return () => {
      onlineOrderState.set({});
    };
  }, []);

  const onAddressSave = (address) => {
    setCustomerInfo((state) => {
      const addresses = [...state.addresses];
      const index = addresses.find((thisAddress) => {
        return thisAddress.googlePlacesId === address.googlePlacesId;
      });
      if (index > -1) {
        addresses.splice(index, 1, address);
      } else {
        addresses.push(address);
      }
      return {...state, addresses};
    });
  };

  useEffect(() => {
    const businessIdFromState = onlineOrderState.businessId.get();
    if (
      !businessIdFromState ||
      businessIdFromState.toString() !== businessId ||
      !onlineOrderState.storeId.get() ||
      !businessId
    ) {
      // toast.warn("Order details not available. Please recreate again.");
      history.push(
        onlineOrderBusinessId.value || businessId
          ? `/order/business/${encodedBusinessId}`
          : "/"
      );
    }
  }, [businessId, history, onlineOrderBusinessId.value]);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const servicesPromise = fetchServicesAndModifiers(storeId.value, postalCode.value);
      const customerInfoPromise = fetchCustomerInfo(storeId.value);
      const storeDeliverySettingsPromise = fetchGeneralDeliverySettings(storeId.value);
      const onDemandDeliverySettingsPromise = fetchOnDemandDeliverySettings(
        storeId.value
      );
      const subscriptionsPromise = fetchSubscriptions();
      const [
        servicesResp,
        customerResp,
        deliverySettingsResp,
        onDemandDeliverySettingsResp,
        subscriptionsResp,
      ] = await Promise.all([
        servicesPromise,
        customerInfoPromise,
        storeDeliverySettingsPromise,
        onDemandDeliverySettingsPromise,
        subscriptionsPromise,
      ]);

      if (servicesResp?.data?.success) {
        setServices(servicesResp.data.services);
      }

      if (customerResp?.data?.success) {
        setCustomerInfo(customerResp.data.customer);

        onlineOrderState.paymentToken.set(
          customerResp?.data?.customer?.paymentMethods?.length
            ? customerResp?.data?.customer?.paymentMethods[0].paymentMethodToken
            : null
        );

        if (customerResp.data?.customer?.storeCustomers.length) {
          onlineOrderState.merge({
            customerNotes: customerResp.data?.customer?.storeCustomers[0].notes,
            isHangDrySelected:
              customerResp.data?.customer?.storeCustomers[0].isHangDrySelected,
            hangDryInstructions:
              customerResp.data?.customer?.storeCustomers[0].hangDryInstructions,
          });
        }
      }

      if (deliverySettingsResp?.data?.success) {
        setGeneralDeliverySettings(deliverySettingsResp.data.generalDeliverySettings);
      }

      if (onDemandDeliverySettingsResp?.data?.success) {
        const onDemandDeliverySettings =
          onDemandDeliverySettingsResp.data.onDemandDeliverySettings;
        const isOnDemandAvailable = await isDoorDashServiceable({
          address: onlineOrderState.customerAddressInfo.get(),
          timeZone: onlineOrderState.addressTimeZone.get(),
          onDemandDeliverySettings: onDemandDeliverySettings,
        });

        setOnDemandDeliverySettings(isOnDemandAvailable ? onDemandDeliverySettings : {});
      }

      if (subscriptionsResp.data.success) {
        setSubscriptions(subscriptionsResp?.data?.subscriptions || []);
      }

      if (cloneOrderType === cloneOrderState.REVIEW) {
        setCurrentStep(orderPickUpSteps.finishingUp);
      }
    } catch (error) {
      toast.error(
        <ToastError
          message={get(error, "response.data.error", "Something went wrong!")}
        />
      );
    } finally {
      setLoading(false);
    }
  }, [cloneOrderType, isDoorDashServiceable, postalCode.value, storeId.value]);

  const fetchAndSetOwnDeliverySettings = async (storeId, zipCode) => {
    try {
      setOwnDeliverySettingsLoading(true);
      const res = await fetchOwnDriverDeliverySettings(storeId, {zipCode});
      setOwnDriverDeliverySettings(res?.data?.ownDriverDeliverySettings);
    } catch (error) {
      toast.error(
        <ToastError
          message={get(error, "response.data.error", "Something went wrong!")}
        />
      );
    } finally {
      setOwnDeliverySettingsLoading(false);
    }
  };

  useEffect(() => {
    if (storeId.value) {
      fetchDetails();
    }
  }, [fetchDetails, storeId.value]);

  useEffect(() => {
    if (storeId.value && postalCode.value) {
      fetchAndSetOwnDeliverySettings(storeId.value, postalCode.value);
    }
  }, [postalCode.value, storeId.value]);

  return (
    <WithTheme businessId={businessId}>
      {currentStep === orderPickUpSteps.details ? (
        <OrderDetails
          loading={
            loading || ownDeliverySettingsLoading || checkingOnDemandServiceability
          }
          generalDeliverySettings={generalDeliverySettings}
          services={services}
          customerAddresses={customerInfo?.addresses}
          onAddressSave={onAddressSave}
          onNextClick={() => {
            setCurrentStep(orderPickUpSteps.finishingUp);
          }}
          businessId={businessId}
        />
      ) : currentStep === orderPickUpSteps.finishingUp ? (
        <FinishingUp
          services={services}
          generalDeliverySettings={generalDeliverySettings}
          onDemandDeliverySettings={onDemandDeliverySettings}
          ownDriverDeliverySettings={ownDriverDeliverySettings}
          customer={customerInfo}
          subscriptions={subscriptions}
          dryCleaningEnabled={businessSettings?.dryCleaningEnabled}
          businessId={businessId}
        />
      ) : null}
    </WithTheme>
  );
};

export default OrderPickupForm;
