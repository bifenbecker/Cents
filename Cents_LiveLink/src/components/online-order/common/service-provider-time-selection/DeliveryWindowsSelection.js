import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {Text, Image, Flex} from "rebass/styled-components";
import {
  IN_STORE_PICKUP,
  RETURN_METHODS,
  TEXT_ME_WHEN_READY,
} from "../../../../constants/order";
import {EmployeeCounterIntake} from "../../../../assets/images";
import windowSelectionActions from "./actions";
import ReturnDeliveryConfirmationPopupBody from "../../../common/return-delivery-confirmation-popup/ReturnDeliveryConfirmationPopupBody";
import OwnDriverFeeDetails from "./OwnDriverFeeDetails";
import OnDemandFeeDetails from "./OnDemandFeeDetails";
import DaySelection from "./DaySelection";
import TimeSelection from "./TimeSelection";
import styles from "./index.styles";

const DeliveryWindowsSelection = ({
  isInStorePickup,
  initIsProcessingCompleted,
  returnMethod,
  dispatch,
  storeSettings,
  turnAroundInHours,
  handleSetDelivery,
  getProcessingCompletedTime,
  currentTabId,
  isPickup,
  selectedOrderDelivery,
  pickup,
  latestDeliveryStartTime,
  timeZone,
  isProcessingCompleted,
  currentOrderDelivery,
  customerAddress,
  setLoading,
  initOrderType,
  canUpdatePickup,
  shouldShowDeliveryWindows,
}) => {
  useEffect(() => {
    if (
      isInStorePickup &&
      returnMethod === RETURN_METHODS.inStorePickup &&
      initIsProcessingCompleted &&
      shouldShowDeliveryWindows
    ) {
      dispatch({
        type: windowSelectionActions.TOGGLE_IN_STORE_PICKUP,
        payload: {
          dayWiseWindows: storeSettings?.dayWiseWindows || [],
          turnAroundInHours,
        },
      });
    }
  }, [
    isInStorePickup,
    returnMethod,
    initIsProcessingCompleted,
    dispatch,
    storeSettings,
    turnAroundInHours,
    shouldShowDeliveryWindows,
  ]);

  return (
    <>
      {(!isPickup && isInStorePickup && initIsProcessingCompleted) ||
      returnMethod === RETURN_METHODS.delivery ? (
        <Flex pb={"10px"}>
          <Text
            {...styles.cancellationText}
            onClick={() => {
              dispatch({
                type: windowSelectionActions.TOGGLE_IN_STORE_PICKUP,
                payload: {
                  dayWiseWindows: storeSettings?.dayWiseWindows || [],
                  turnAroundInHours,
                },
              });
            }}
          >
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
              <ReturnDeliveryConfirmationPopupBody
                onClick={() => handleSetDelivery(false)}
                day={getProcessingCompletedTime?.day}
                time={getProcessingCompletedTime?.time}
                turnaroundInHours={turnAroundInHours}
              />
            </Flex>
          )}
        </>
      ) : (
        <>
          {currentTabId === "OWN_DRIVER" ? (
            <OwnDriverFeeDetails isPickup={isPickup} settings={storeSettings || {}} />
          ) : (
            <OnDemandFeeDetails
              isPickup={isPickup}
              settings={storeSettings || {}}
              currentUberEstimate={selectedOrderDelivery?.uberEstimate}
              currentDoorDashEstimate={selectedOrderDelivery?.doorDashEstimate}
            />
          )}
          <DaySelection
            pickup={pickup}
            selectedDate={selectedOrderDelivery?.selectedDate}
            setSelectedDate={({selectedDate, isPastDate}) => {
              dispatch({
                type: windowSelectionActions.SET_SELECTED_DATE,
                payload: {
                  selectedDate,
                  latestDeliveryStartTime,
                  isPastDate,
                },
              });
            }}
            timeZone={timeZone}
            currentTabId={currentTabId}
            dayWiseWindows={storeSettings?.dayWiseWindows}
            latestDeliveryStartTime={latestDeliveryStartTime}
            isProcessingCompleted={isProcessingCompleted}
            currentOrderDelivery={currentOrderDelivery}
            isPickup={isPickup}
          />
          <TimeSelection
            isPickup={isPickup}
            currentTabId={currentTabId} // or selectedOrderDelivery.deliveryProvider
            storeSettings={storeSettings}
            selectedDate={selectedOrderDelivery?.selectedDate}
            uberAuthToken={selectedOrderDelivery?.uberAuthToken}
            selectedTimeWindow={selectedOrderDelivery?.deliveryWindow}
            customerAddress={customerAddress}
            timeZone={timeZone}
            uberEstimate={selectedOrderDelivery?.uberEstimate}
            dispatch={dispatch}
            setLoading={setLoading}
            turnAroundInHours={turnAroundInHours}
            timingsId={selectedOrderDelivery?.timingsId}
            isInStorePickup={isInStorePickup}
            latestDeliveryStartTime={latestDeliveryStartTime}
            currentOrderDelivery={currentOrderDelivery}
            selectedOrderDelivery={selectedOrderDelivery}
            orderType={initOrderType}
            isProcessingCompleted={isProcessingCompleted}
            canUpdatePickup={canUpdatePickup}
          />
        </>
      )}
    </>
  );
};

DeliveryWindowsSelection.propTypes = {
  isInStorePickup: PropTypes.bool,
  turnAroundInHours: PropTypes.number.isRequired,
  isProcessingCompleted: PropTypes.bool,
  timeZone: PropTypes.string,
  customerAddress: PropTypes.object.isRequired,
  setLoading: PropTypes.func,
  storeSettings: PropTypes.object,
  initIsProcessingCompleted: PropTypes.bool,
  returnMethod: PropTypes.string,
  dispatch: PropTypes.func,
  handleSetDelivery: PropTypes.func,
  getProcessingCompletedTime: PropTypes.object,
  currentTabId: PropTypes.string,
  isPickup: PropTypes.bool,
  selectedOrderDelivery: PropTypes.object,
  pickup: PropTypes.object,
  latestDeliveryStartTime: PropTypes.object,
  currentOrderDelivery: PropTypes.object,
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
  isPickup: false,
  canUpdatePickup: false,
};

export default DeliveryWindowsSelection;
