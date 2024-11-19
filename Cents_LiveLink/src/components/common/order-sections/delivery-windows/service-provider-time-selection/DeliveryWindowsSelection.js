import React, {useContext, useEffect, useMemo} from "react";
import PropTypes from "prop-types";
import {Flex, Image, Text} from "rebass/styled-components";
import {
  IN_STORE_PICKUP,
  RETURN_METHODS,
  TEXT_ME_WHEN_READY,
} from "../../../../../constants/order";
import {EmployeeCounterIntake} from "../../../../../assets/images";
import {setSelectedTimeWindowAction, toggleInstorePickupAction} from "./actions";
import WindowsSelectionDispatch from "./context";

import ReturnDeliveryConfirmationContent from "../../../../../components/common/return-delivery-confirmation-popup/ReturnDeliveryConfirmationContent.js";
import OwnDriverFeeDetails from "./OwnDriverFeeDetails";
import OnDemandFeeDetails from "./OnDemandFeeDetails";
import DaySelection from "./DaySelection";
import TimeSelection from "./TimeSelection";
import styles from "./index.styles";
import {getTimeFromMilliSeconds} from "../../../../../utils/date";
import {getAutoScheduledDelivery} from "./utils";
import {buildDeliveryOptions} from "./reducer-functions";
import {getEarliestDeliveryStartTime} from "utils/schedule/getWindows";
import PillTabs from "components/common/PillTabs";
import {AvailableDatesView} from "components/online-order/business/schedule/AvailableDatesView";

const DeliveryWindowsSelection = ({
  tabs,
  onTabChange,
  isInStorePickup,
  initIsProcessingCompleted,
  storeSettings,
  getProcessingCompletedTime,
  currentTabId,
  selectedOrderDelivery,
  ownDeliveryStore,
  onDemandDeliveryStore,
  customerAddress,
  setLoading,
  canUpdatePickup,
  state,
  shouldShowDeliveryWindows,
  turnAroundInHours,
  autoScheduleReturnDelivery,
}) => {
  const {dispatch} = useContext(WindowsSelectionDispatch);
  const {
    returnMethod,
    isPickup,
    orderDelivery: {pickup, delivery, deliveryFee},
  } = state;

  useEffect(() => {
    if (autoScheduleReturnDelivery) {
      const minTime = pickup?.deliveryWindow?.[0];
      const minTimeObject = getTimeFromMilliSeconds(minTime, state.timeZone);

      const autoScheduledDelivery = getAutoScheduledDelivery(
        minTimeObject,
        {
          timingsId: selectedOrderDelivery.timingsId,
          deliveryWindow: selectedOrderDelivery.deliveryWindow,
        },
        storeSettings?.ownDeliverySettings?.deliveryWindowBufferInHours,
        {
          ...buildDeliveryOptions({
            orderType: state.orderType,
            orderDelivery: {
              pickup,
              delivery,
            },
            isDeliveryWindowSelectedManually: true,
            ownDriverDeliverySettings: ownDeliveryStore,
            onDemandDeliverySettings: onDemandDeliveryStore,
            isPickup: false,
            pickupDayWiseWindows: state?.pickupDayWiseWindows,
            returnDayWiseWindows: state?.returnDayWiseWindows,
            timeZone: state.timeZone,
            turnAroundInHours: state.turnAroundInHours,
          }),
          isAutoScheduleDelivery: true,
        }
      );

      const payload = {
        windowTimings: {
          timingsId: autoScheduledDelivery.timingsId,
          deliveryWindow: autoScheduledDelivery.deliveryWindow,
        },
        autoScheduleReturn: true,
      };

      dispatch(setSelectedTimeWindowAction(payload));
    }
  }, [selectedOrderDelivery]);

  const earliestDeliveryStartTime = getEarliestDeliveryStartTime(state);

  const handleToggleDeliveryMethod = () => {
    dispatch(toggleInstorePickupAction());
  };

  useEffect(() => {
    if (isInStorePickup && initIsProcessingCompleted && shouldShowDeliveryWindows) {
      dispatch(toggleInstorePickupAction());
    }
  }, [isInStorePickup, initIsProcessingCompleted, dispatch, shouldShowDeliveryWindows]);

  return (
    <>
      {(!isPickup && isInStorePickup && initIsProcessingCompleted) ||
      returnMethod === RETURN_METHODS.delivery ? (
        <Flex pb={"10px"}>
          <Text {...styles.cancellationText} onClick={handleToggleDeliveryMethod}>
            {isInStorePickup
              ? ""
              : initIsProcessingCompleted
              ? IN_STORE_PICKUP
              : !isPickup
              ? TEXT_ME_WHEN_READY
              : ""}
          </Text>
        </Flex>
      ) : null}
      {!isPickup && (isInStorePickup || !returnMethod) ? (
        <>
          {initIsProcessingCompleted ? (
            <>
              {isInStorePickup ? (
                <>
                  <Text variant="inStorePickupHeader">{IN_STORE_PICKUP}</Text>
                  <Text variant="inStorePickupText">
                    Your laundry is ready for pickup.
                  </Text>
                  <Flex>
                    <Image
                      {...styles.employeeCounterIntake}
                      src={EmployeeCounterIntake}
                    />
                  </Flex>
                </>
              ) : null}
            </>
          ) : (
            <Flex {...styles.turnAroundTimeWrapper}>
              <ReturnDeliveryConfirmationContent
                onScheduleNowClick={handleToggleDeliveryMethod}
                day={getProcessingCompletedTime?.day}
                time={getProcessingCompletedTime?.time}
                turnAroundInHours={turnAroundInHours || null}
              />
            </Flex>
          )}
        </>
      ) : (
        <div className="schedule-content">
          {/* <DaySelection
            selectedDate={selectedOrderDelivery?.selectedDate}
            currentTabId={currentTabId}
            dayWiseWindows={storeSettings?.dayWiseWindows}
            state={state}
            storeSettings={storeSettings || {}}
          />
          {tabs.length > 1 && (state.isPickup || !isInStorePickup) ? (
            <PillTabs
              tabs={tabs}
              currentTabId={currentTabId}
              onTabChange={onTabChange}
              wrapperStyle={{mb: "24px", fontSize: ["14px", "16px"]}}
            />
          ) : null} */}
          <AvailableDatesView />
          {/* <TimeSelection
            state={state}
            currentTabId={currentTabId} // or selectedOrderDelivery.deliveryProvider
            storeSettings={storeSettings}
            selectedDate={selectedOrderDelivery?.selectedDate}
            selectedTimeWindow={selectedOrderDelivery?.deliveryWindow}
            customerAddress={customerAddress}
            setLoading={setLoading}
            timingsId={selectedOrderDelivery?.timingsId}
            isInStorePickup={isInStorePickup}
            earliestDeliveryStartTime={earliestDeliveryStartTime}
            selectedOrderDelivery={selectedOrderDelivery}
            orderType={state.orderType}
            canUpdatePickup={canUpdatePickup}
          /> */}
        </div>
      )}
    </>
  );
};

DeliveryWindowsSelection.propTypes = {
  customerAddress: PropTypes.object.isRequired,
  setLoading: PropTypes.func,
  storeSettings: PropTypes.object,
  initIsProcessingCompleted: PropTypes.bool,
  handleSetDelivery: PropTypes.func,
  getProcessingCompletedTime: PropTypes.object,
  currentTabId: PropTypes.string,
  selectedOrderDelivery: PropTypes.object,
  initOrderType: PropTypes.string,
  canUpdatePickup: PropTypes.bool,
};

DeliveryWindowsSelection.defaultProps = {
  isInStorePickup: false,
  isProcessingCompleted: false,
  setLoading: undefined,
  storeSettings: {},
  initIsProcessingCompleted: false,
  dispatch: () => {},
  handleSetDelivery: () => {},
  canUpdatePickup: false,
};

export default DeliveryWindowsSelection;
