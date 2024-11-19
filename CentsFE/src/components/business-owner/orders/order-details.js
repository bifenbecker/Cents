import React, {useRef, useEffect, useState} from "react";
import moment from "moment";
import momenttz from "moment-timezone";
import isEmpty from "lodash/isEmpty";
import _ from "lodash";
import {UncontrolledPopover} from "reactstrap";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

//icons
import keyIcon from "../../../assets/images/key.svg";
import tagIcon from "../../../assets/images/tag.svg";
import basketIcon from "../../../assets/images/Icon_Basket.svg";
import smallClockIcon from "../../../assets/images/clock.svg";
import dollarIcon from "../../../assets/images/dollar.svg";
import scaleIcon from "../../../assets/images/Icon_Scale_Weigh.svg";
import clockIcon from "../../../assets/images/Icon_Clock_Side_Panel.svg";
import deliveryIcon from "../../../assets/images/Icon_Delivery.svg";

//local imports
import Timeline from "../../commons/timeline/timeline";
import IconInsight from "../../commons/icon-insight/icon-insight";
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";
import Modal from "../../commons/modal/modal";
import {TURN_STATUS} from "../../../constants";

import {
  getOrderLiveLink,
  cancelOrder,
  fetchPreferencesChoices,
} from "../../../api/business-owner/orders";
import {
  refundStripePayment,
  refundCashPayment,
} from "../../../api/business-owner/payments";
import {SESSION_ENV_KEY, REACT_APP_LIVE_LINK_URL} from "../../../utils/config";
import {centsToDollarsDisplay} from "../global-settings/locations/utils/location";

const deliveryProviders = {
  OWN_DRIVER: "Own Driver",
  DOORDASH: "DoorDash",
};

const getSalesWeightLog = (weightLogs) => {
  let initWeightLog = weightLogs?.find((log) => log.step === 1);
  return initWeightLog;
};

const getPriceString = (orderItem, order) => {
  let quantityUnit = orderItem?.pricingType === "PER_POUND" ? "lb" : "unit";

  let perUnitString = `$${orderItem.price?.toFixed(2)} / ${quantityUnit}`;

  if (order && order.orderableType === "InventoryOrder") {
    perUnitString = `$${orderItem.lineItemCost?.toFixed(2)} / ${quantityUnit}`;
  }

  let minPriceString = `${orderItem.minimumQuantity?.toFixed(
    2
  )} ${quantityUnit} @ $${orderItem.minimumPrice?.toFixed(2)}`;

  if (orderItem?.pricingType === "PER_POUND" && orderItem.hasMinPrice) {
    if (orderItem.weightLogs[0]?.chargeableWeight > orderItem.minimumQuantity) {
      minPriceString += ` + ${(
        orderItem.weightLogs[0]?.chargeableWeight - orderItem.minimumQuantity
      ).toFixed(2)} ${quantityUnit} @ ${perUnitString}`;
    } else if (!orderItem.weightLogs.length) {
      minPriceString += ` + ${perUnitString}`;
    }
  }

  return orderItem.hasMinPrice ? minPriceString : perUnitString;
};

const getLatestOrderStatus = (activityLog) => {
  const filteredActivityLog = _.sortBy(activityLog, ["id"]);
  return filteredActivityLog[filteredActivityLog.length - 1];
};

const getDeliveryServicePrice = (service) => {
  if (service?.price) {
    return `$${service.price}`;
  } else {
    return "Free";
  }
};

const generateTimelineData = (order) => {
  const {rack, isProcessedAtHub} = order;

  // This mapping object doesn't contain the Intake status yet.
  const statusTimelineLabelMap = {
    IN_TRANSIT_TO_HUB: "Pickup by driver at Store",
    DROPPED_OFF_AT_HUB: "Dropoff by driver at Hub",
    RECEIVED_AT_HUB_FOR_PROCESSING: "Receive at Hub",
    HUB_PROCESSING_ORDER: "Processing",
    IN_TRANSIT_TO_STORE: "Pickup by driver at Hub",
    DROPPED_OFF_AT_STORE: "Dropoff by driver at Store",
    COMPLETED: "Pickup & Complete",
    PROCESSING: "Processing",
    CANCELLED: "Cancel",
    PAYMENT_REQUIRED: "Balance due",
    READY_FOR_DRIVER_PICKUP: "Ready for driver pickup",
    EN_ROUTE_TO_CUSTOMER: "En route to customer, with driver",
    READY_FOR_INTAKE: "Ready for intake at store",
  };

  // Check if the current order's acitivityLog has a status of READY_FOR_PROCESSING
  const statusReadyForProcessingExists = order.activityLog.some(
    (log) => log.status === "READY_FOR_PROCESSING"
  );

  // If the order's activityLog has a status of READY_FOR_PROCESSING,
  // add this status to the mapping object with the value of Intake
  if (statusReadyForProcessingExists) {
    statusTimelineLabelMap.READY_FOR_PROCESSING = "Intake";
  } else {
    // else add a status of DESIGNATED_FOR_PROCESSING_AT_HUB with the value of Intake
    statusTimelineLabelMap.DESIGNATED_FOR_PROCESSING_AT_HUB = "Intake";
  }

  if (order.isProcessedAtHub) {
    statusTimelineLabelMap.READY_FOR_PICKUP = "Receive at store";
  }

  if (order?.orderType === "ONLINE") {
    statusTimelineLabelMap.SUBMITTED = "Submitted Online";
    // statusTimelineLabelMap.EN_ROUTE_TO_STORE = "Picked up my driver"; //TODO HANDLE FOR UBER DRIVER
    // statusTimelineLabelMap.DELIVERED_AND_COMPLETE = "Delivered & Complete";
  }

  const filteredActivityLog = _.sortBy(
    order.activityLog.filter((log) =>
      Object.keys(statusTimelineLabelMap).includes(log.status)
    ),
    ["id"]
  );

  return filteredActivityLog.map((log) => {
    let isTick = log.status === "COMPLETED";
    let isRed = log.status === "CANCELLED";

    let timeString;

    const timezone = momenttz.tz.guess();

    if (["HUB_PROCESSING_ORDER", "PROCESSING"].includes(log.status)) {
      let processingEndStatus =
        log.status === "HUB_PROCESSING_ORDER"
          ? "HUB_PROCESSING_COMPLETE"
          : "READY_FOR_PICKUP";
      let endLog = order.activityLog.find((log) => log.status === processingEndStatus);
      let endString = endLog
        ? momenttz.tz(endLog.updatedAt, timezone).format("- MM/DD/YY, hh:mma z")
        : "";
      timeString = `${momenttz
        .tz(log.updatedAt, timezone)
        .format("MM/DD/YY, hh:mma z")} ${endString}`;
    } else {
      timeString = momenttz.tz(log.updatedAt, timezone).format("MM/DD/YY, hh:mma z");
    }

    if (rack) {
      timeString =
        (isProcessedAtHub && log.status === "READY_FOR_PICKUP") ||
        (!isProcessedAtHub && log.status === "PROCESSING") ||
        (order.orderType === "RESIDENTIAL" && log.status === "HUB_PROCESSING_ORDER")
          ? `${timeString} (Rack #${rack})`
          : timeString;
    }

    return {
      isTick,
      title: log.isAdjusted ? "Adjust Order" : statusTimelineLabelMap[log.status],
      dataLines: [timeString, log.employeeName],
      isRed,
    };
  });
};

// Render methods

const renderDetailsSection = (order) => {
  let {
    customer,
    hub,
    store,
    isProcessedAtHub,
    placedAt,
    employee,
    weightLogs,
    activityLog,
    orderableType,
    orderType,
  } = order;

  let salesWeightLog = getSalesWeightLog(weightLogs);
  let timezone = momenttz.tz.guess();

  let totalWeight = salesWeightLog ? salesWeightLog.totalWeight.toFixed(2) : 0;
  let chargeableWeight = salesWeightLog ? salesWeightLog.chargeableWeight.toFixed(2) : 0;

  let employeeName;
  const residentialStatusList = [
    "READY_FOR_PROCESSING",
    "HUB_PROCESSING_ORDER",
    "DROPPED_OFF_AT_HUB",
  ];

  let nonResidentialStatusList = [
    "READY_FOR_PROCESSING",
    "DESIGNATED_FOR_PROCESSING_AT_HUB",
  ];
  if (orderableType === "ServiceOrder") {
    let orderIntakeActivityLog = activityLog.find(
      (activity) => activity.status === "READY_FOR_PROCESSING"
    );

    if (!orderIntakeActivityLog) {
      orderIntakeActivityLog = activityLog.find((activity) => {
        if (orderType === "RESIDENTIAL") {
          return residentialStatusList.includes(activity.status);
        } else {
          return nonResidentialStatusList.includes(activity.status);
        }
      });
    }

    employeeName = orderIntakeActivityLog?.employeeName || "-";
  } else {
    employeeName = employee?.name || "-";
  }

  const manageOnBehalfOf = async () => {
    try {
      const res = await getOrderLiveLink(order.id);
      let token;
      const orderToken = res.data.url.split("/")[4];
      token = localStorage.getItem(SESSION_ENV_KEY);
      token = JSON.parse(token).token;
      const url =
        REACT_APP_LIVE_LINK_URL +
        `verify-account?orderToken=${orderToken}&access_token=${token}`;
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (newWindow) newWindow.opener = null;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="section">
      <img src={keyIcon} alt="" className="section-icon" />
      <div className="section-content">
        <p className="title">KEY DETAILS</p>
        <div className="section-content-row">
          <div className="sub-section">
            <p className="sub-section-title">Customer</p>
            <p className="sub-section-data wrappable">{customer.fullName || "Guest"}</p>
            <p className="sub-section-data wrappable">{customer.phoneNumber}</p>
            <p className="sub-section-data wrappable">{customer.email}</p>
          </div>
          <div className="spacer"></div>
          <div className="sub-section">
            <p className="sub-section-title">Location</p>
            {isProcessedAtHub ? (
              <>
                <p className="sub-section-data wrappable">Origin: {store?.address}</p>
                <p className="sub-section-data wrappable">
                  Processed: {hub?.address} (Hub)
                </p>
              </>
            ) : (
              <>
                <p className="sub-section-data wrappable">{store?.address}</p>
              </>
            )}
          </div>
        </div>

        <div className="section-content-row">
          <div className="sub-section">
            <p className="sub-section-title">Intake Date & Time</p>
            <p className="sub-section-data wrappable">
              {momenttz.tz(placedAt, timezone).format("MM/DD/YYYY hh:mma z")}
            </p>
          </div>

          <div className="spacer"></div>

          <div className="sub-section">
            <p className="sub-section-title">Intake Team Member</p>
            <p className="sub-section-data wrappable">{employeeName}</p>
          </div>
        </div>

        {order.orderableType !== "InventoryOrder" && (
          <div className="sub-section top-padding">
            <p className="sub-section-title">Sales Weight</p>
            <p className="sub-section-data wrappable">{`${totalWeight} lbs (${chargeableWeight} lbs chargeable)`}</p>
          </div>
        )}
        {order.orderableType === "ServiceOrder" && (
          <button
            className="btn-theme btn-rounded save-button mt-4 px-4"
            onClick={manageOnBehalfOf}
          >
            MANAGE ORDER
          </button>
        )}
      </div>
    </div>
  );
};

const renderProcessingSection = (order, preferences) => {
  const {activityLog, turns} = order;

  const renderWashDryBag = () => {
    const startLog = activityLog.find(
      (log) => log.status === "HUB_PROCESSING_ORDER" || log.status === "PROCESSING"
    );
    const endLog = activityLog.find(
      (log) =>
        log.status === "HUB_PROCESSING_COMPLETE" || log.status === "PROCESSING_COMPLETE"
    );
    const timezone = momenttz.tz.guess();

    if (!startLog) {
      return null;
    }
    return (
      <div className="sub-section top-padding">
        <p className="sub-section-title">Wash, Dry, Fold</p>
        {turns.map((turn) => {
          return (
            <p className="sub-section-data wrappable" key={turn.id}>
              {turn?.machine?.type}-{turn?.machine?.name} -{" "}
              {turn?.deviceId ? TURN_STATUS[turn?.status] : "Added"}{" "}
              {turn?.machine?.type.dryer && turn.totalTurnTime
                ? `(${Number(turn.totalTurnTime)} mins) `
                : null}
              {!turn?.deviceId
                ? "(machine not networked)"
                : turn.startedAt
                ? `(started ${turn.startedAt})`
                : null}
              {turn?.employee?.id
                ? `- ${turn?.employee?.firstName} ${turn?.employee?.lastName}`
                : null}
            </p>
          );
        })}
      </div>
    );
  };

  const renderNotes = () => {
    return (
      <div className="sub-section top-padding">
        <p className="sub-section-title">Notes</p>
        <p className="sub-section-data wrappable">
          {order.notes || "Notes are not added for this order"}
        </p>
      </div>
    );
  };

  const renderCustomerNotes = () => {
    return (
      <div className="sub-section top-padding">
        <p className="sub-section-title">Customer Notes</p>
        <p className="sub-section-data wrappable">
          {order?.customer?.notes || "No customer preferences added"}
        </p>
      </div>
    );
  };

  const renderCustomerPreferenceChoices = (preferences) => {
    return (
      <div className="sub-section top-padding">
        <p className="sub-section-title">Preferences & Special Instructions</p>
        {preferences?.choices?.map((choice) => {
          return (
            <p key={choice.id} className="sub-section-data wrappable">
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#7b7b7b",
                  textTransform: "capitalize",
                }}
              >
                {choice.label}
              </span>
              : {choice.value}
            </p>
          );
        })}
      </div>
    );
  };

  const renderCustomerHangDryChoice = ({isHangDrySelected, hangDryInstructions}) => {
    return (
      <>
        <div className="sub-section top-padding">
          <p className="sub-section-title">Hang Dry</p>
          <p className="sub-section-data wrappable">{isHangDrySelected ? "Yes" : "No"}</p>
        </div>

        {isHangDrySelected && hangDryInstructions && (
          <div className="sub-section top-padding">
            <p className="sub-section-title">Hang Dry Instructions</p>
            <p className="sub-section-data wrappable">{hangDryInstructions}</p>
          </div>
        )}
      </>
    );
  };

  const renderWeights = () => {
    let {weightLogs} = order;

    const status_weight_label_map = {
      DESIGNATED_FOR_PROCESSING_AT_HUB: "Sales Weight: ",
      READY_FOR_PROCESSING: "Sales Weight: ",
      HUB_PROCESSING_ORDER: "Pre-Processing Weight: ",
      PROCESSING: "Pre-Processing Weight: ",
      HUB_PROCESSING_COMPLETE: "Post-Processing Weight: ",
      READY_FOR_PICKUP: order.isProcessedAtHub
        ? "Receive Back at Store Weight: "
        : "Post-Processing Weight: ",
      COMPLETED: "Pickup Weight: ",
    };

    if (order?.orderType === "RESIDENTIAL") {
      status_weight_label_map["RECEIVED_AT_HUB_FOR_PROCESSING"] = "Sales Weight: ";
    }

    let weightElements = weightLogs?.map((weight) => {
      if (status_weight_label_map[weight.status]) {
        return (
          <p key={`Weight-${weight.id}`} className="sub-section-data wrappable">{`${
            status_weight_label_map[weight.status]
          } ${weight.totalWeight}`}</p>
        );
      }
    });
    return (
      <div className="sub-section top-padding">
        <p className="sub-section-title">Weight Review</p>
        {weightElements?.length === 0 ? (
          <p className="sub-section-data wrappable">No weights logged</p>
        ) : (
          weightElements
        )}
      </div>
    );
  };

  const renderBagTracking = () => {
    const {serviceOrderBags, isBagTrackingEnabled, isProcessedAtHub} = order;

    let bagTrackingElements;

    if (!isProcessedAtHub) {
      return null;
    }

    if (!serviceOrderBags || serviceOrderBags.length === 0) {
      bagTrackingElements = (
        <p className="sub-section-data wrappable">{`No bags found for this order`}</p>
      );
    } else if (isBagTrackingEnabled) {
      bagTrackingElements = serviceOrderBags.map((bag, index) => {
        return (
          <p key={`Weight-${bag.id}`} className="sub-section-data wrappable">{`Bag #${
            index + 1
          }: ${bag.barcode || "-"}`}</p>
        );
      });
    } else {
      bagTrackingElements = (
        <p className="sub-section-data wrappable">{`Bag count: ${serviceOrderBags.length}`}</p>
      );
    }

    return (
      <div className="sub-section top-padding">
        <p className="sub-section-title">Bag Tracking</p>
        {bagTrackingElements}
      </div>
    );
  };

  return (
    <div className="section">
      <img src={basketIcon} alt="" className="section-icon" />
      <div className="section-content">
        <p className="title">PROCESSING</p>

        {renderWashDryBag()}
        {renderCustomerNotes()}
        {preferences.enabled && renderCustomerPreferenceChoices(preferences)}
        {preferences.enabled &&
          preferences.hangDry.isEnabled &&
          renderCustomerHangDryChoice(preferences.hangDry)}
        {renderNotes()}
        {renderWeights()}
        {renderBagTracking()}
      </div>
    </div>
  );
};

const isDeliveryOrder = (order) => {
  const deliverServices = order?.orderItems.filter(
    (item) => item.serviceCategory === "DELIVERY"
  );
  return order.orderType === "ONLINE" || deliverServices?.length;
};

/**
 * Format the delivery windows based on time zone
 *
 * @param {String} timeZone
 * @param {Array} deliveryWindow
 */
const formatDeliveryWindows = (timeZone, deliveryWindow) => {
  const deliveryStartWindow = momenttz
    .tz(deliveryWindow[0] * 1, timeZone)
    .format("MM/DD/YY, hh:mma z");
  const deliveryEndWindow = momenttz
    .tz(deliveryWindow[1] * 1, timeZone)
    .format("MM/DD/YY, hh:mma z");

  return [deliveryStartWindow, deliveryEndWindow];
};

/**
 * Render an individual pickup or delivery
 *
 * @param {Object} delivery
 */
const renderIndividualDelivery = (delivery, idx) => {
  const timeZone = momenttz.tz.guess();
  const [startWindow, endWindow] = formatDeliveryWindows(
    timeZone,
    delivery.deliveryWindow
  );
  const deliveryProvider = deliveryProviders[delivery.deliveryProvider];
  const deliveredAtTime = momenttz
    .tz(delivery.deliveredAt, timeZone)
    .format("MM/DD/YY, hh:mma z");
  return (
    <div key={`delivery_${idx}`} className="sub-section top-padding">
      <p className="sub-section-title">
        {delivery.type === "PICKUP" ? "Pickup" : "Delivery"}
      </p>
      <p className="sub-section-data wrappable">
        {`${
          delivery.type === "PICKUP" ? "Pickup" : "Delivery"
        } Provider: ${deliveryProvider}`}
      </p>
      {delivery.deliveryProvider === "DOORDASH" && (
        <p className="sub-section-data wrappable">
          {`DoorDash ID: ${delivery.thirdPartyDeliveryId}`}
        </p>
      )}
      <p className="sub-section-data wrappable">{`${
        delivery.type === "PICKUP" ? "Pickup" : "Delivery"
      } Window: ${startWindow} - ${endWindow}`}</p>
      <p className="sub-section-data wrappable">{`Status: ${delivery.status}`}</p>
      {delivery.deliveredAt && delivery.type === "PICKUP" && (
        <p className="sub-section-data wrappable">{`Delivered to Store: ${deliveredAtTime}`}</p>
      )}
      {delivery.deliveredAt && delivery.type === "RETURN" && (
        <p className="sub-section-data wrappable">{`Delivered Back to Customer: ${deliveredAtTime}`}</p>
      )}
      <p className="sub-section-data wrappable">{`Cost (Delivery Fee + Tip): $${Number(
        Number(delivery.totalDeliveryCost) + Number(delivery.courierTip)
      ).toFixed(2)}`}</p>
    </div>
  );
};

/**
 * Render the delivery details for an order
 *
 * @param {Object} order
 */
const renderDeliveryDetails = (order) => {
  const {deliveries} = order;
  return (
    <div className="section">
      <img src={deliveryIcon} alt="deliveries-icon" className="section-icon" />
      <div className="section-content">
        <p className="title">DELIVERIES</p>
        {deliveries.map((delivery, idx) => renderIndividualDelivery(delivery, idx))}
      </div>
    </div>
  );
};

const OrderDetails = ({
  order,
  isLoading,
  error,
  hasNoOrdersToDisplay,
  searchText,
  setActiveTab,
  businessSettings,
  flags,
  reloadOrder,
}) => {
  const scrollRef = useRef();
  const keyDetaisRef = useRef();
  const salesRef = useRef();
  const processingRef = useRef();
  const deliveriesRef = useRef();
  const timelineRef = useRef();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showVoidOrderModal, setShowVoidOrderModal] = useState(false);
  const [voidOrderError, setVoidOrderError] = useState();
  const [isVoidingOrder, setIsVoidingOrder] = useState(false);
  const [preferences, setPreferences] = useState({enabled: false});
  const [showRefundPaymentModal, setShowRefundPaymentModal] = useState(false);
  const [paymentToRefund, setPaymentToRefund] = useState(null);
  const [refundError, setRefundError] = useState(null);
  const [isRefundingPayment, setIsRefundingPayment] = useState(false);

  const scrollTabs = {
    KEY_DETAILS: "KEY_DETAILS",
    SALES: "SALES",
    PROCESSING: "PROCESSING",
    DELIVERIES: "DELIVERIES",
    TIMELINE: "TIMELINE",
  };

  const [activeScrollTab, setActiveScrollTab] = useState(scrollTabs.KEY_DETAILS);

  // Did Mount
  useEffect(() => {
    const scrollView = scrollRef.current;
    if (scrollView) {
      scrollView.addEventListener("scroll", handleScroll);
      scrollView.scrollTop = 0;
    }
    return () => {
      scrollView && scrollView.removeEventListener("scroll", handleScroll);
    };
  }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (order.customer) {
      fetchCustomerPreferences();
    }
  }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

  function processPreferences(preferences = []) {
    const result = [];

    for (const preference of preferences) {
      const choiceInfo = {label: preference.fieldName, id: preference.id};
      let choiceValue = "no selection";

      if (preference.type === "single") {
        let selectedOption = preference.options.find((option) => option.selected);
        if (typeof selectedOption === "undefined") {
          selectedOption = preference.options.find((option) => option.isDefault);
        }
        if (typeof selectedOption !== "undefined") {
          choiceValue = selectedOption.value;
        }
      } else {
        let selectedOptions = preference.options.filter((option) => option.selected);
        if (selectedOptions.length > 0) {
          choiceValue = selectedOptions
            .map((option) => option.value[0].toUpperCase() + option.value.substring(1))
            .join(",");
        }
      }
      choiceInfo.value = choiceValue;
      result.push(choiceInfo);
    }
    return result;
  }

  async function feedPreferences(businessSettings) {
    let hangDry = {isEnabled: businessSettings.data.settings.isHangDryEnabled};

    if (hangDry.isEnabled) {
      hangDry = {
        ...hangDry,
        isHangDrySelected: order.customer.isHangDrySelected,
        hangDryInstructions: order.customer.hangDryInstructions,
      };
    }
    const preferenceChoices = await fetchPreferencesChoices(
      order.store.businessId,
      order.customer.centsCustomerId
    );

    if (preferenceChoices?.data?.success) {
      const processedPreferences = processPreferences(preferenceChoices.data.preferences);

      setPreferences({
        hangDry,
        enabled: true,
        choices: processedPreferences,
      });
    }
  }

  async function fetchCustomerPreferences() {
    if (businessSettings?.data?.settings?.isCustomPreferencesEnabled) {
      await feedPreferences(businessSettings);
    } else {
      setPreferences({enabled: false});
    }
  }

  if (!(order.orderId || order.ordersId)) {
    if (isLoading) {
      return (
        <div className="order-details-container">
          <BlockingLoader />
        </div>
      );
    }
    if (hasNoOrdersToDisplay) {
      return (
        <div className="order-details-no-orders-container">
          <p className="order-details-message-text">
            {searchText
              ? "No data for the search criteria"
              : "No orders for this location"}
          </p>
        </div>
      );
    }
    if (error) {
      return <p className="order-details-message-text error-text">{error}</p>;
    }
    return <p className="order-details-message-text">Please select an order</p>;
  }

  let intakeWeight = order?.weightLogs?.find((log) => log.step === 1);
  let durationEndLog = order.activityLog?.find(
    (log) => log.status === "READY_FOR_PICKUP"
  );
  let durationEndTime = (durationEndLog && durationEndLog.updatedAt) || new Date();
  let timeDiff = moment.duration(moment(durationEndTime).diff(moment(order?.placedAt)));
  let hoursSince = timeDiff?.asHours();

  const handleScroll = _.debounce((e) => {
    const currentScroll = e.target.scrollTop;

    if (currentScroll < salesRef.current.offsetTop) {
      setActiveScrollTab(scrollTabs.KEY_DETAILS);
    }

    if (
      currentScroll > salesRef.current.offsetTop &&
      currentScroll < processingRef.current.offsetTop
    ) {
      setActiveScrollTab(scrollTabs.SALES);
    }

    if (
      currentScroll > processingRef.current.offsetTop &&
      currentScroll < deliveriesRef.current.offsetTop
    ) {
      setActiveScrollTab(scrollTabs.PROCESSING);
    }

    if (
      currentScroll > deliveriesRef.current.offsetTop &&
      currentScroll < timelineRef.current.offsetTop
    ) {
      setActiveScrollTab(scrollTabs.DELIVERIES);
    }

    if (currentScroll > timelineRef.current.offsetTop) {
      setActiveScrollTab(scrollTabs.TIMELINE);
    }
  }, 100);

  const handleScrollTabClick = (tab) => {
    if (tab === scrollTabs.KEY_DETAILS) {
      scrollRef.current.scrollTop = keyDetaisRef.current.offsetTop;
      setActiveScrollTab(tab);
    } else if (tab === scrollTabs.SALES) {
      scrollRef.current.scrollTop = salesRef.current.offsetTop;
      setActiveScrollTab(tab);
    } else if (tab === scrollTabs.PROCESSING) {
      scrollRef.current.scrollTop = processingRef.current.offsetTop;
      setActiveScrollTab(tab);
    } else if (tab === scrollTabs.DELIVERIES) {
      scrollRef.current.scrollTop = deliveriesRef.current.offsetTop;
      setActiveScrollTab(tab);
    } else if (tab === scrollTabs.TIMELINE) {
      scrollRef.current.scrollTop = timelineRef.current.offsetTop;
      setActiveScrollTab(tab);
    }
  };

  let durationString;

  if (hoursSince > 72) {
    durationString = "72+ hrs";
  } else {
    durationString = `${Math.floor(hoursSince)}:${timeDiff?.minutes()}`;
  }

  const voidOrder = async () => {
    setVoidOrderError(null);
    setIsVoidingOrder(true);
    try {
      await cancelOrder(order?.id);
      setVoidOrderError(null);
      setShowVoidOrderModal(false);
      setActiveTab();
    } catch (error) {
      setVoidOrderError("Could not void the order!");
    } finally {
      setIsVoidingOrder(false);
    }
  };

  /**
   * Process a refund for a given payment.
   *
   * This will perform the following:
   *
   * 1) Create a Refund model entry for the given payment;
   * 2) Change the status of the individual payment to "refunded";
   * 3) Set the paymentStatus of the ServiceOrder to BALANCE_DUE;
   * 4) Update the balanceDue of the ServiceOrder
   */
  const refundPayment = async () => {
    try {
      setIsRefundingPayment(true);

      if (paymentToRefund.paymentProcessor === "stripe") {
        await refundStripePayment(paymentToRefund.id);
      } else if (paymentToRefund.paymentProcessor === "cash") {
        await refundCashPayment(paymentToRefund.id);
      } else {
        setPaymentToRefund(null);
        setShowRefundPaymentModal(false);
        setRefundError(null);
        setIsRefundingPayment(false);
        return;
      }

      setPaymentToRefund(null);
      setShowRefundPaymentModal(false);
      setRefundError(null);
      setIsRefundingPayment(false);

      return reloadOrder();
    } catch (e) {
      setRefundError(e.response.data.error);
      setIsRefundingPayment(false);
    }
  };

  const closeVoidOrderModal = () => {
    setShowVoidOrderModal(false);
    setVoidOrderError(null);
  };

  const closeRefundModal = () => {
    setShowRefundPaymentModal(false);
    setPaymentToRefund(null);
  };

  const renderSalesSection = () => {
    let {
      customer,
      orderItems,
      payments,
      notificationLogs,
      tipAmount,
      promotion,
      creditAmount,
      convenienceFee,
      taxAmount,
      salesTaxAmount,
      isTaxable,
      pickupDeliveryFee,
      pickupDeliveryTip,
      returnDeliveryFee,
      returnDeliveryTip,
      recurringDiscountInCents,
      subscription,
    } = order;
    const renderServices = () => {
      let services = orderItems.filter((item) => item.isService);

      let servicesTotalAmount = 0;
      const isOrderStatusSubmitted =
        order.orderType === "ONLINE" &&
        getLatestOrderStatus(order.activityLog)?.status === "SUBMITTED";

      const servicesData = services.map((service) => {
        let {laundryType, count, pricingType, orderItemId, modifiers, weightLogs} =
          service;
        servicesTotalAmount += service.itemTotal;

        let quantityUnit = pricingType === "PER_POUND" ? "lbs" : "";
        return (
          <div key={orderItemId}>
            <p className="sub-section-data wrappable">
              {`${laundryType} (${
                service.category === "DELIVERY"
                  ? getDeliveryServicePrice(service)
                  : getPriceString(service)
              })`}
              {service.category === "FIXED_PRICE" && !isOrderStatusSubmitted
                ? ` x ${count} ${quantityUnit}`
                : ""}
            </p>
            {modifiers ? (
              <div>
                {modifiers.map((modifier) => {
                  let salesWeightLog = getSalesWeightLog(weightLogs);
                  let chargeableWeight = salesWeightLog
                    ? salesWeightLog.chargeableWeight.toFixed(2)
                    : 0;
                  servicesTotalAmount += modifier.price * chargeableWeight;
                  return (
                    <p
                      key={modifier.id}
                      className="sub-section-data wrappable withLeftMargin"
                    >
                      {`${modifier.name} (+$${modifier.price} / lb) ${
                        !isOrderStatusSubmitted
                          ? `x ${chargeableWeight} ${quantityUnit}`
                          : ""
                      }`}
                    </p>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      });

      servicesData.push(
        <p key={`services-total`} className="sub-section-data wrappable">
          {!isOrderStatusSubmitted ? `Total: $${servicesTotalAmount?.toFixed(2)}` : ""}
        </p>
      );

      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">Services</p>
          {servicesData}
        </div>
      );
    };

    const renderProducts = () => {
      let products = orderItems.filter((item) => !item.isService);

      if (!products || products.length === 0) {
        return null;
      }

      let productsTotalAmount = 0;

      const productsData = products.map((product) => {
        let {orderItemId, count, itemTotal, laundryType} = product;

        if (order.orderableType === "InventoryOrder") {
          orderItemId = product.inventoryItemId;
          count = product.lineItemQuantity;
          itemTotal = product.lineItemTotalCost;
          laundryType = product.lineItemName;
        }

        productsTotalAmount += itemTotal;

        return (
          <p
            key={orderItemId}
            className="sub-section-data wrappable"
          >{`${laundryType} (${getPriceString(product, order)}) x ${count}`}</p>
        );
      });

      productsData.push(
        <p
          key={`products-total`}
          className="sub-section-data wrappable"
        >{`Total: $${productsTotalAmount?.toFixed(2)}`}</p>
      );

      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">Products</p>
          {productsData}
        </div>
      );
    };

    const renderPayments = () => {
      if (
        order.orderType === "ONLINE" &&
        !["EN_ROUTE_TO_CUSTOMER", "COMPLETED"].includes(
          getLatestOrderStatus(order.activityLog).status
        )
      ) {
        return (
          <div className="sub-section top-padding">
            <p className="sub-section-title">Payments</p>
          </div>
        );
      } else {
        let paymentElements = payments?.map((payment, index) => {
          let serialNumber = `${index + 1}. `;
          const timezone = momenttz.tz.guess();
          let paymentDate = momenttz
            .tz(payment.createdAt, timezone)
            .format("dddd, MMMM DD, hh:mma z");

          const paymentType =
            payment.paymentProcessor === "ESD"
              ? `ESD - ${payment.esdReceiptNumber}`
              : payment.paymentProcessor === "CCI"
              ? `CCI - ${payment.paymentToken}`
              : `Debit/Credit - ${payment.paymentToken}`;

          const refundable =
            payment.status === "succeeded" &&
            (payment.paymentProcessor === "stripe" ||
              payment.paymentProcessor === "cash") &&
            flags?.stripeRefunds;

          return (
            <div key={`${payment.id}-fragment`} className="sub-section-row">
              <>
                <div>
                  <p
                    key={payment.id}
                    className="sub-section-data wrappable"
                  >{`${serialNumber} $${payment.totalAmount?.toFixed(
                    2
                  )} - ${paymentDate}`}</p>
                  <p
                    key={`${payment.id}-second-row`}
                    className="sub-section-data margin-bottom"
                  >
                    {paymentType} - {payment.status}
                  </p>
                </div>
                <div>
                  {refundable && (
                    <p
                      className="clickable-text"
                      onClick={() => {
                        setShowRefundPaymentModal(true);
                        setPaymentToRefund(payment);
                      }}
                    >
                      Refund
                    </p>
                  )}
                </div>
              </>
            </div>
          );
        });

        return (
          <div className="sub-section top-padding">
            <p className="sub-section-title">Payments</p>
            {paymentElements}
          </div>
        );
      }
    };

    const renderNotificationLogs = () => {
      let logElements = notificationLogs?.map((notification) => {
        const timezone = momenttz.tz.guess();
        let dateString = momenttz
          .tz(notification.notifiedAt, timezone)
          .format("MM/DD/YY [at] hh:mma z");
        let status = notification.status?.replace(/_/g, " ");
        return (
          <p
            key={notification.id}
            className="sub-section-data wrappable margin-bottom"
          >{`${dateString} with status ${status} (${notification.language?.language})`}</p>
        );
      });
      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">Notifications</p>
          {logElements && logElements.length === 0 ? (
            <p className="sub-section-data wrappable margin-bottom">
              No notifications sent for this order
            </p>
          ) : (
            logElements
          )}
        </div>
      );
    };

    const renderPromotions = (promotionValue) => {
      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">Applied Promotion</p>
          <p className="sub-section-data">{`${
            promotion?.promoDetails?.balanceRule.explanation
          } ($${promotionValue.toFixed(2)})`}</p>
        </div>
      );
    };

    const renderInStoreTipping = () => {
      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">In-Store Tipping</p>
          <p className="sub-section-data"> ${(tipAmount || 0).toFixed(2)} </p>
        </div>
      );
    };

    const renderCredits = () => {
      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">Applied Credit</p>
          <p className="sub-section-data"> ${(creditAmount || 0).toFixed(2)} </p>
        </div>
      );
    };

    const renderConvenienceFee = () => {
      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">Service Fee</p>
          <p className="sub-section-data"> ${(convenienceFee || 0).toFixed(2)} </p>
        </div>
      );
    };

    const renderSubscriptionDiscount = () => {
      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">Recurring Delivery Discount</p>
          <p className="sub-section-data">
            {subscription?.recurringDiscountInPercent}% off (
            {centsToDollarsDisplay(recurringDiscountInCents)})
          </p>
        </div>
      );
    };

    const renderTax = () => {
      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">Tax</p>
          <p className="sub-section-data">
            ${(salesTaxAmount || taxAmount || 0).toFixed(2)}{" "}
          </p>
        </div>
      );
    };

    const getPickupDeliveryFee = () => {
      return (
        pickupDeliveryFee + pickupDeliveryTip + returnDeliveryFee + returnDeliveryTip
      );
    };

    const renderPickupOrDeliveryFee = () => {
      return (
        <div className="sub-section top-padding">
          <p className="sub-section-title">Pickup/Delivery</p>
          <p className="sub-section-data">${getPickupDeliveryFee().toFixed(2)} </p>
        </div>
      );
    };

    return (
      <div className="section">
        <img src={tagIcon} alt="" className="section-icon" />
        <div className="section-content">
          <p className="title">SALES</p>
          {order.orderableType !== "InventoryOrder" && (
            <div className="sub-section top-padding">
              <p className="sub-section-title">Customer</p>
              <p className="sub-section-data wrappable">{customer.fullName}</p>
              <p className="sub-section-data wrappable">{customer.phoneNumber}</p>
              <p className="sub-section-data wrappable">{customer.email}</p>
            </div>
          )}

          {order.orderableType !== "InventoryOrder" && renderServices()}
          {renderProducts()}
          {!isEmpty(promotion) ? renderPromotions(order?.promotionAmount || 0) : null}
          {!isEmpty(subscription) &&
          Number(recurringDiscountInCents) > 0 &&
          Number(subscription?.recurringDiscountInPercent) > 0
            ? renderSubscriptionDiscount()
            : null}
          {isTaxable ? renderTax() : null}
          {tipAmount ? renderInStoreTipping() : null}
          {creditAmount ? renderCredits() : null}
          {convenienceFee ? renderConvenienceFee() : null}
          {getPickupDeliveryFee() > 0 ? renderPickupOrDeliveryFee() : null}
          {renderPayments()}
          {order.orderableType !== "InventoryOrder" && renderNotificationLogs()}
        </div>
      </div>
    );
  };

  return (
    <div className="order-details-container">
      {isLoading && <BlockingLoader />}
      <div className="header cents-card-header small-padding flex-row">
        {order?.orderCodeWithPrefix}
        {isDeliveryOrder(order) ? (
          <div className="order-details-hub-label">Delivery</div>
        ) : order.orderableType !== "InventoryOrder" && order.isProcessedAtHub ? (
          <div className="order-details-hub-label">Hub/Spoke</div>
        ) : null}
        {order?.status === "CANCELLED" ? (
          <div className="order-details-cancel-label">Canceled</div>
        ) : null}
        {order?.canCancel ? (
          <>
            <div
              className={`void-order-three-dot-menu ${showDropdown ? "open" : ""}`}
              id="three-dot-menu-orders"
            />
            <UncontrolledPopover
              trigger="legacy"
              placement="bottom-end"
              target="three-dot-menu-orders"
              isOpen={showDropdown}
              toggle={() => setShowDropdown(!showDropdown)}
            >
              <p
                onClick={() => {
                  setShowDropdown(false);
                  setShowVoidOrderModal(true);
                }}
              >
                Void order
              </p>
            </UncontrolledPopover>
          </>
        ) : null}
      </div>

      {showVoidOrderModal ? (
        <Modal>
          <div className="archive-pop-up-container">
            {isVoidingOrder ? <BlockingLoader /> : null}
            <p className="void-order-container">
              <div className="header">Are you sure you want to void this order?</div>
              {order?.refundAmount
                ? `The collected payment of $${order?.refundAmount?.toFixed(
                    2
                  )} will be issued as credit to this customer and the order cannot be reactivated.`
                : "You will not be able to reactivate it."}
            </p>
            <div className="modal-buttons-container">
              <button
                className="btn-theme btn-transparent btn-rounded small-button"
                onClick={closeVoidOrderModal}
              >
                CANCEL
              </button>
              <button className="btn-theme btn-rounded small-button" onClick={voidOrder}>
                CONFIRM
              </button>
            </div>
            {voidOrderError ? (
              <div className="error-message">{voidOrderError}</div>
            ) : null}
          </div>
        </Modal>
      ) : null}

      {showRefundPaymentModal ? (
        <Modal>
          <div className="archive-pop-up-container">
            {isRefundingPayment ? <BlockingLoader /> : null}
            <div className="void-order-container">
              <p className="header">Are you sure you want to refund this payment?</p>
              <p>
                The collected payment of $
                {paymentToRefund?.totalAmount?.toFixed(2) || "$0.00"} will be refunded to
                the customer and they will see the refund as a credit approximately 5-10
                business days later, depending upon the bank.
              </p>
            </div>
            <div className="modal-buttons-container">
              <button
                className="btn-theme btn-transparent btn-rounded small-button"
                onClick={closeRefundModal}
              >
                CANCEL
              </button>
              <button
                className="btn-theme btn-rounded small-button"
                onClick={refundPayment}
              >
                CONFIRM
              </button>
            </div>
            {refundError ? <div className="error-message">{refundError}</div> : null}
          </div>
        </Modal>
      ) : null}

      <div className="scroll-control">
        <p
          className={activeScrollTab === scrollTabs.KEY_DETAILS ? "active" : ""}
          onClick={() => {
            handleScrollTabClick(scrollTabs.KEY_DETAILS);
          }}
        >
          Key Details
        </p>
        <div className="seperation-point"></div>
        <p
          className={activeScrollTab === scrollTabs.SALES ? "active" : ""}
          onClick={() => {
            handleScrollTabClick(scrollTabs.SALES);
          }}
        >
          Sales
        </p>
        {order.orderableType !== "InventoryOrder" && (
          <>
            <div className="seperation-point"></div>
            <p
              className={activeScrollTab === scrollTabs.PROCESSING ? "active" : ""}
              onClick={() => {
                handleScrollTabClick(scrollTabs.PROCESSING);
              }}
            >
              Processing
            </p>
            <div className="seperation-point"></div>
            {order.deliveries.length > 0 && (
              <>
                <p
                  className={activeScrollTab === scrollTabs.DELIVERIES ? "active" : ""}
                  onClick={() => {
                    handleScrollTabClick(scrollTabs.DELIVERIES);
                  }}
                >
                  Deliveries
                </p>
                <div className="seperation-point"></div>
              </>
            )}
            <p
              className={activeScrollTab === scrollTabs.TIMELINE ? "active" : ""}
              onClick={() => {
                handleScrollTabClick(scrollTabs.TIMELINE);
              }}
            >
              Timeline
            </p>
          </>
        )}
      </div>

      <div className="scrollable-content-container" ref={scrollRef}>
        <div className="section">
          <div className="insights-container">
            <IconInsight
              icon={dollarIcon}
              value={`$${order.netOrderTotal?.toFixed(2)}`}
              description={"Total Order Value"}
              className="order-details-insight"
            />
            {order.orderableType !== "InventoryOrder" && (
              <>
                <IconInsight
                  icon={scaleIcon}
                  value={`${(intakeWeight?.totalWeight || 0).toFixed(2)} lbs`}
                  description={"Total Order Weight"}
                  className="order-details-insight"
                />
                <IconInsight
                  icon={clockIcon}
                  value={durationString}
                  description={"Total Order Duration"}
                  className="order-details-insight"
                />
              </>
            )}
          </div>
        </div>
        <div className="horizontal-separator" ref={keyDetaisRef}></div>
        {renderDetailsSection(order)}
        <div className="horizontal-separator" ref={salesRef}></div>
        {renderSalesSection()}
        <div className="horizontal-separator" ref={processingRef}></div>
        {order.orderableType !== "InventoryOrder" &&
          renderProcessingSection(order, preferences)}
        <div className="horizontal-separator" ref={deliveriesRef}></div>
        {order?.deliveries?.length > 0 && renderDeliveryDetails(order)}
        <div className="horizontal-separator" ref={timelineRef}></div>
        {order.orderableType !== "InventoryOrder" && (
          <div className="section">
            <img src={smallClockIcon} alt="" className="section-icon" />
            <div className="section-content">
              <p className="title">ORDER TIMELINE</p>
              <Timeline data={generateTimelineData(order)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withLDConsumer()(OrderDetails);
