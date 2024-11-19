import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";
import {toast} from "react-toastify";

import useToggle from "../../../../hooks/useToggle";
import {ORDER_TYPES} from "../../../order-summary/constants";
import {orderChoices, TEXT_ME_WHEN_READY} from "../../../../constants/order";
import {formatWindow} from "../../../../utils/date";
import {isSameAsOriginalWindow} from "./service-provider-time-selection/utils";
import {checkIsSubscriptionWithSameTime} from "./utils";

import {DockModal, ToastError} from "../..";
import ServiceProviderTimeSelection from "./service-provider-time-selection";
import CreateSubscriptionPopupModal from "../../CreateSubscriptionPopupModal";
import CurrentOrAllRecurringOrdersChoice from "../../CurrentOrAllRecurringOrdersChoice";
import ViewSusbcriptionPopup from "../../ViewSusbcriptionPopup";

const DeliveryWindowsDockModalForm = (props) => {
  const {
    isOpen,
    toggle,
    timeZone,
    dockProps,
    returnMethod,
    orderDelivery,
    customerAddress,
    ownDeliveryStore,
    intakeCompletedAt,
    turnAroundInHours,
    onDemandDeliveryStore,
    onServiceProviderTimeChange,
    isProcessingCompleted,
    orderType,
    subscription: currentSubscription,
    canCreateSubscription,
    autoUpdateSubscription,
    recurringDiscountInPercent,
    showSubscriptionBanner,
    prevSubscriptions,
    shouldShowDeliveryWindows,
    skipInitialValidation,
    ...rest
  } = props;

  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState({...currentSubscription});
  const [currentDeliveryTypeHeader, setCurrentDeliveryTypeHeader] = useState();
  const [showNewSubscriptionPopup, setShowNewSubscriptionPopup] = useState(false);
  const [showViewSubscriptionPopup, setShowViewSubscriptionPopup] = useState(false);
  const [deliveryWindowsSelection, setDeliveryWindowsSelection] = useState({});
  const [forceOrderDeliveryType, setForceOrderDeliveryType] = useState();
  const {
    isOpen: showOrderUpdateChoice,
    setIsOpen: setShowOrderUpdateChoice,
    toggle: toggleOrderUpdateChoice,
  } = useToggle();

  useEffect(() => {
    setSubscription({...currentSubscription});
  }, [currentSubscription]);

  const validatePrevSubscriptions = (newOrderDelivery) => {
    if (
      !isEmpty(prevSubscriptions) &&
      checkIsSubscriptionWithSameTime(newOrderDelivery, prevSubscriptions, timeZone)
    ) {
      toast.error(
        <ToastError
          message={
            "You already have an active recurring order scheduled at the same time. Please choose a different time."
          }
        />
      );
      return false;
    }
    return true;
  };

  const validateForSameWindow = (orderDelivery) => {
    const {pickup, delivery} = orderDelivery;
    if (isSameAsOriginalWindow(pickup, delivery)) {
      toast.error(
        <ToastError
          message={
            "Pickup and Delivery windows cannot be same for a recurring order.\nPlease choose 'This order only' option if you want to schedule for this window."
          }
        />
      );
      return false;
    }
    return true;
  };

  const handleDeliveryWindowsChange = (data) => {
    setDeliveryWindowsSelection(data);
    if (canCreateSubscription) {
      // When creating subscription for the first time.
      setShowNewSubscriptionPopup(true);
    } else if (
      !autoUpdateSubscription &&
      orderType === ORDER_TYPES.online &&
      !isEmpty(subscription) &&
      !subscription.deletedAt
    ) {
      // In Manage Order when different order delivery
      if (checkIsSamePickupDelivery(data?.orderDelivery)) {
        onServiceProviderTimeChange({
          ...data,
          subscription: {...subscription},
        });
      } else {
        setShowOrderUpdateChoice(true);
      }
    } else {
      // In finishing up screen/manage order(same order delivery/susbcription is not there).
      if (
        !isEmpty(subscription) &&
        !subscription.id &&
        !validatePrevSubscriptions(data?.orderDelivery)
      ) {
        return;
      }
      onServiceProviderTimeChange({
        ...data,
        subscription: !isEmpty(subscription)
          ? {
              id: subscription.id,
              interval: subscription?.interval,
              pickupWindow: data?.orderDelivery?.pickup?.deliveryWindow || [],
              returnWindow: data?.orderDelivery?.delivery?.deliveryWindow || [],
              servicePriceId: subscription?.servicePriceId,
              modifierIds: subscription?.modifierIds || [],
              pickupTimingsId: data?.orderDelivery?.pickup?.timingsId,
              deliveryTimingsId: data?.orderDelivery?.delivery?.timingsId,
              paymentToken: subscription?.paymentToken,
            }
          : {},
      });
    }
  };

  const checkIsSamePickupDelivery = (newOrderDelivery) => {
    const isPickupSame = isSameAsOriginalWindow(
      newOrderDelivery?.pickup,
      orderDelivery?.pickup
    );
    const isDeliverySame = newOrderDelivery?.delivery?.timingsId
      ? isSameAsOriginalWindow(newOrderDelivery?.delivery, orderDelivery?.delivery)
      : returnMethod === "IN_STORE_PICKUP";
    return isPickupSame && isDeliverySame;
  };

  const handleDeliveryWindowUpdate = (choice) => {
    if (
      choice === orderChoices.currentAndFutureOrders &&
      (!validatePrevSubscriptions(deliveryWindowsSelection?.orderDelivery) ||
        !validateForSameWindow(deliveryWindowsSelection?.orderDelivery))
    ) {
      return;
    }
    setShowOrderUpdateChoice(false);
    onServiceProviderTimeChange({
      ...deliveryWindowsSelection,
      subscription:
        choice === orderChoices.currentAndFutureOrders
          ? {
              id: subscription.id,
              interval: subscription.interval,
              pickupWindow:
                deliveryWindowsSelection?.orderDelivery?.pickup?.deliveryWindow || [],
              returnWindow:
                deliveryWindowsSelection?.orderDelivery?.delivery?.deliveryWindow || [],
              servicePriceId: subscription?.servicePriceId,
              modifierIds: subscription?.modifierIds || [],
              pickupTimingsId: deliveryWindowsSelection?.orderDelivery?.pickup?.timingsId,
              deliveryTimingsId:
                deliveryWindowsSelection?.orderDelivery?.delivery?.timingsId || null,
              paymentToken: subscription?.paymentToken,
            }
          : subscription || {},
    });
  };

  const handleScheduleDeliveryClick = (orderType) => {
    setShowNewSubscriptionPopup(false);
    setForceOrderDeliveryType(orderType);
  };

  const handleSkipNewSubscription = () => {
    onServiceProviderTimeChange({...deliveryWindowsSelection, subscription: {}});
    setShowNewSubscriptionPopup(false);
  };

  const handleAddNewSubscription = ({interval}) => {
    if (!validatePrevSubscriptions(deliveryWindowsSelection?.orderDelivery)) {
      return;
    }
    onServiceProviderTimeChange({
      ...deliveryWindowsSelection,
      subscription: {
        interval,
        pickupWindow:
          deliveryWindowsSelection?.orderDelivery?.pickup?.deliveryWindow || [],
        returnWindow:
          deliveryWindowsSelection?.orderDelivery?.delivery?.deliveryWindow || [],
        servicePriceId: subscription?.servicePriceId,
        modifierIds: subscription?.modifierIds || [],
        pickupTimingsId:
          deliveryWindowsSelection?.orderDelivery?.pickup?.timingsId || null,
        deliveryTimingsId:
          deliveryWindowsSelection?.orderDelivery?.delivery?.timingsId || null,
        paymentToken: subscription?.paymentToken,
      },
    });
    setShowNewSubscriptionPopup(false);
  };

  const handleNewSubscriptionClick = (data) => {
    setDeliveryWindowsSelection(data);
    setShowNewSubscriptionPopup(true);
  };

  const handleViewSubscriptionClick = (data) => {
    setDeliveryWindowsSelection(data);
    setShowViewSubscriptionPopup(true);
  };

  const handleSubscriptionFieldChange = ({field, value}) => {
    switch (field) {
      case "interval":
        setSubscription((state) => ({...state, interval: value}));
        break;
      case "isDeleted":
        setSubscription({});
        setShowViewSubscriptionPopup(false);
        break;
      default:
        break;
    }
  };

  const windows = {
    pickup: subscription?.pickup
      ? subscription?.pickup
      : deliveryWindowsSelection?.orderDelivery?.pickup?.deliveryWindow?.length
      ? formatWindow(
          deliveryWindowsSelection?.orderDelivery?.pickup?.deliveryWindow,
          timeZone
        )
      : null,
    delivery: subscription?.delivery
      ? subscription?.delivery
      : deliveryWindowsSelection?.orderDelivery?.delivery?.deliveryWindow?.length
      ? formatWindow(
          deliveryWindowsSelection?.orderDelivery?.delivery?.deliveryWindow,
          timeZone
        )
      : TEXT_ME_WHEN_READY,
  };
  return (
    <div className="schedule-container">
      <DockModal
        showExitIcon
        header={`Schedule ${currentDeliveryTypeHeader}`}
        isOpen={isOpen}
        toggle={toggle}
        loading={loading}
        size={1}
        dockStyle={{overflow: "initial"}}
      >
        <ServiceProviderTimeSelection
          isAllWindowsRequirement
          timeZone={timeZone}
          setLoading={setLoading}
          returnMethod={returnMethod}
          orderDelivery={orderDelivery}
          customerAddress={customerAddress}
          ownDeliveryStore={ownDeliveryStore}
          turnAroundInHours={turnAroundInHours}
          onDemandDeliveryStore={onDemandDeliveryStore}
          onServiceProviderTimeChange={handleDeliveryWindowsChange}
          intakeCompletedAt={intakeCompletedAt}
          orderType={orderType || ORDER_TYPES.online}
          isProcessingCompleted={isProcessingCompleted}
          onDeliveryTypeChange={setCurrentDeliveryTypeHeader}
          subscription={subscription}
          showSubscriptionBanner={showSubscriptionBanner}
          onNewSubscriptionClick={handleNewSubscriptionClick}
          onViewSubscriptionClick={handleViewSubscriptionClick}
          forceOrderDeliveryType={forceOrderDeliveryType}
          setForceOrderDeliveryType={setForceOrderDeliveryType}
          shouldShowDeliveryWindows={shouldShowDeliveryWindows}
          skipInitialValidation={skipInitialValidation}
          {...rest}
        />
        <CreateSubscriptionPopupModal
          isOpen={showNewSubscriptionPopup}
          toggle={() => setShowNewSubscriptionPopup(!showNewSubscriptionPopup)}
          pickupTime={windows?.pickup}
          deliveryTime={windows?.delivery}
          discount={recurringDiscountInPercent}
          onAddSubscription={handleAddNewSubscription}
          onSkipSubscription={handleSkipNewSubscription}
          onScheduleDelivery={handleScheduleDeliveryClick}
        />
        {showViewSubscriptionPopup && (
          <ViewSusbcriptionPopup
            isOpen={showViewSubscriptionPopup}
            toggle={() => setShowViewSubscriptionPopup(!showViewSubscriptionPopup)}
            subscription={
              !isEmpty(subscription)
                ? {...subscription, ...windows, centsCustomerAddress: customerAddress}
                : {}
            }
            onSubscriptionFieldChange={handleSubscriptionFieldChange}
          />
        )}
        {showOrderUpdateChoice && (
          <CurrentOrAllRecurringOrdersChoice
            isOpen={showOrderUpdateChoice}
            toggle={toggleOrderUpdateChoice}
            header="Edit Scheduling"
            onSubmit={handleDeliveryWindowUpdate}
          />
        )}
      </DockModal>
    </div>
  );
};

DeliveryWindowsDockModalForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  dockProps: PropTypes.object,
  canCreateSubscription: PropTypes.bool,
  autoUpdateSubscription: PropTypes.bool,
  recurringDiscountInPercent: PropTypes.number,
  isProcessingCompleted: PropTypes.bool,
  intakeCompletedAt: PropTypes.string,
  timeZone: PropTypes.string,
  returnMethod: PropTypes.string,
  turnAroundInHours: PropTypes.number.isRequired,
  header: PropTypes.string,
  orderDelivery: PropTypes.object.isRequired,
  customerAddress: PropTypes.object.isRequired,
  ownDeliveryStore: PropTypes.object,
  onDemandDeliveryStore: PropTypes.object,
  onServiceProviderTimeChange: PropTypes.func.isRequired,
  subscription: PropTypes.object,
  showSubscriptionBanner: PropTypes.bool,
  updateSubscription: PropTypes.func,
  prevSubscriptions: PropTypes.array,
  skipInitialValidation: PropTypes.bool,
};

DeliveryWindowsDockModalForm.defaultProps = {
  header: "Scheduling",
  returnMethod: null,
  isProcessingCompleted: false,
  autoUpdateSubscription: false,
  canCreateSubscription: false,
  recurringDiscountInPercent: 0,
  showSubscriptionBanner: false,
  prevSubscriptions: [],
  skipInitialValidation: false,
};

export default DeliveryWindowsDockModalForm;
