import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {Box, Flex, Text, Image, Button} from "rebass/styled-components";
import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {toast} from "react-toastify";
import get from "lodash/get";

// APIs and Utils
import {
  getUberAuthenticationToken,
  // getDeliveryEstimate,
  createUberDelivery,
  createOwnNetworkReturnDelivery,
} from "../../api/delivery";
import {
  fetchOwnDriverDeliverySettings,
  fetchOnDemandDeliverySettings,
} from "../../api/online-order";
import {
  updateCustomerPhoneNumber,
  saveDeliveryInstructions,
  addCustomerPaymentMethod,
} from "../../api/customer";
import {
  createDoorDashReturnDelivery,
  // getDoorDashDeliveryEstimate,
} from "../../api/doordash";
import {generateHumanReadableDeliveryWindow} from "../../utils/date";
import {getCreditCardBrandIcon} from "../../utils/payment";

// Icons
import {
  DateAndTimeIcon,
  RoutesIcon,
  ExitIcon,
  RightChevronIcon,
  IllustrationDelivery,
  TruckIcon,
} from "../../assets/images";

// Components
import DeliveryAddress from "./address/DeliveryAddress";
import DeliveryTime from "./time/DeliveryTime";
import AddPaymentMethod from "../payment/AddPaymentMethod";
import CustomerPhoneNumber from "./phone/CustomerPhoneNumber";
import PaymentMethodList from "../payment/PaymentMethodList";
import DeliveryInstructions from "./instructions/DeliveryInstructions";
import {Loader} from "../common";
import ToastError from "../common/ToastError";
import AddDeliveryTip from "../online-order/business/order-pickup-form/finishing-up/add-delivery-tip";

// Utils
import {STRIPE_PUBLIC_KEY} from "../../utils/config";

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const DeliveryOverview = (props) => {
  const {order, closeModal, updateOrderDetails, paymentMethods, selectedPaymentMethod} =
    props;

  const mounted = useRef(false);

  const [loading, setLoading] = useState();
  const [showDeliveryOverview, setShowDeliveryOverview] = useState(true);
  const [showDeliveryAddress, setShowDeliveryAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState();
  const [deliveryAddressObject, setDeliveryAddressObject] = useState();
  const [showDeliveryTime, setShowDeliveryTime] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState();
  const [deliveryDisplayTime, setDeliveryDisplayTime] = useState();
  const [showDeliveryInstructions, setShowDeliveryInstructions] = useState(false);
  const [showCustomerPhoneNumberSection, setShowCustomerPhoneNumberSection] =
    useState(false);
  const [uberAuthToken, setUberAuthToken] = useState();
  const [deliveryEstimate, setDeliveryEstimate] = useState();
  const [deliveryEstimatePrice, setDeliveryEstimatePrice] = useState(null);
  const [showPaymentMethodScreen, setShowPaymentMethodScreen] = useState(false);
  // const [deliveryEstimateArray, setDeliveryEstimateArray] = useState();
  const [showPaymentMethodListScreen, setShowPaymentMethodListScreen] = useState(false);
  const [deliveryProvider, setDeliveryProvider] = useState();
  const [paymentMethodList, setPaymentMethodList] = useState(
    paymentMethods
      ? paymentMethods
      : order.paymentMethods?.length
      ? order.paymentMethods
      : null
  );
  const [selectedPaymentMethodDetails, setSelectedPaymentMethodDetails] = useState(
    selectedPaymentMethod
      ? selectedPaymentMethod
      : paymentMethodList.length
      ? paymentMethodList[0]
      : order.paymentMethods?.length
      ? order.paymentMethods[0]
      : null
  );
  const [uberPickupAt, setUberPickupAt] = useState();
  const [timingsId, setTimingsId] = useState();
  const [showDeliveryTipModal, setShowDeliveryTipModal] = useState();
  const deliveryTip = 0;
  const [deliverySettingsLoading, setDeliverySettingsLoading] = useState({
    onDemand: false,
    ownDriver: false,
  });
  const [onDemandDeliverySettings, setOnDemandDeliverySettings] = useState({});
  const [ownDriverDeliverySettings, setOwnDriverDeliverySettings] = useState({});

  const [addressToValidate, setAddressToValidate] = useState();

  const doordashStores = useMemo(() => {
    return process.env.REACT_APP_DOORDASH_STORES?.split(",");
  }, []);

  /**
   * fetch onDemand delivery setting for the particualar store
   */
  const fetchOnDemandSettings = useCallback(async () => {
    try {
      setDeliverySettingsLoading((oldLoading) => ({...oldLoading, onDemand: true}));
      const res = await fetchOnDemandDeliverySettings(order?.store?.id);
      if (res?.data?.success) {
        return res?.data?.onDemandDeliverySettings;
      }
    } catch (error) {
      toast.error(
        <ToastError message={"Error while fetching on demand delivery settings"} />
      );
      console.error(
        get(
          error,
          "response.data.error",
          "Error while fetching on demand delivery settings"
        )
      );
    } finally {
      setDeliverySettingsLoading((oldLoading) => ({...oldLoading, onDemand: false}));
    }
  }, [order]);

  /**
   * Fetch onDriver delivery setting for the particualar store and whenever zipcode changes
   * @param {Object} params
   */
  const fetchOwnDriverSettings = useCallback(
    async (params) => {
      try {
        setDeliverySettingsLoading((oldLoading) => ({...oldLoading, ownDriver: true}));
        const res = await fetchOwnDriverDeliverySettings(order?.store?.id, params);
        if (res?.data?.success) {
          return res?.data?.ownDriverDeliverySettings;
        }
      } catch (error) {
        toast.error(
          <ToastError message={"Error while fetching own demand delivery settings"} />
        );
        console.error(
          get(
            error,
            "response.data.error",
            "Error while fetching own demand delivery settings"
          )
        );
      } finally {
        setDeliverySettingsLoading((oldLoading) => ({...oldLoading, ownDriver: false}));
      }
    },
    [order]
  );

  /**
   * Generate an uber authentication token and set it in state
   */
  const authenticateWithUber = async () => {
    const uberAuthentication = await getUberAuthenticationToken();
    setUberAuthToken(uberAuthentication.data.uberToken);
  };

  /**
   * Render the header code
   */
  const renderHeader = () => {
    return (
      <Flex {...styles.headerRowContainer}>
        <Flex {...styles.headerColumnContainer}>
          <Image
            {...styles.svgImage}
            onClick={() => {
              closeModal();
            }}
            src={ExitIcon}
          />
          <Text {...styles.headerRowText}>Schedule Delivery</Text>
        </Flex>
      </Flex>
    );
  };

  /**
   * Render the main delivery image above delivery details
   */
  const renderDeliveryImage = () => {
    return (
      <Flex {...styles.mainImageContainer}>
        <Image src={IllustrationDelivery} />
      </Flex>
    );
  };

  /**
   * Render the delivery details section, which includes:
   *
   * 1) Delivery address row
   * 2) Delivery time row
   * 3) Delivery instructions row
   */
  const renderDeliveryDetails = () => {
    return (
      <>
        <Flex {...styles.sectionHeader}>
          <Text>Delivery Details</Text>
        </Flex>
        {renderDeliveryAddress()}
        {renderSelectedDeliveryTime()}
        {renderDeliveryInstructions()}
      </>
    );
  };

  /**
   * Render the selected delivery address row
   */
  const renderDeliveryAddress = () => {
    return (
      <Flex {...styles.deliveryRowContainer} onClick={showDeliveryAddressComponent}>
        <Flex {...styles.iconContainer}>
          <Image src={RoutesIcon} />
        </Flex>
        <Flex {...styles.detailsContainer}>
          <Flex {...styles.deliveryDetailsTextContainer}>
            <Text {...styles.deliveryDetailsRowText}>Delivery Address</Text>
            <Text {...styles.deliveryDetailsRowSubtext}>
              {deliveryAddressObject
                ? deliveryAddressObject.address1
                : "Add delivery address"}
            </Text>
          </Flex>
          <Image src={RightChevronIcon} />
        </Flex>
      </Flex>
    );
  };

  /**
   * Render the selected delivery time window row
   */
  const renderSelectedDeliveryTime = () => {
    const timeDisplay = deliveryDisplayTime ? deliveryDisplayTime : "Set delivery time";

    return (
      <Flex {...styles.deliveryRowContainer} onClick={showDeliveryTimeComponent}>
        <Flex {...styles.iconContainer}>
          <Image src={DateAndTimeIcon} />
        </Flex>
        <Flex {...styles.detailsContainer}>
          <Flex {...styles.deliveryDetailsTextContainer}>
            <Text {...styles.deliveryDetailsRowText}>Delivery Time</Text>
            <Text {...styles.deliveryDetailsRowSubtext}>{timeDisplay}</Text>
          </Flex>
          <Image src={RightChevronIcon} />
        </Flex>
      </Flex>
    );
  };

  /**
   * Render the row containing delivery instructions for a given address
   */
  const renderDeliveryInstructions = () => {
    const instructionsDisplay = deliveryAddressObject?.instructions
      ? deliveryAddressObject?.instructions
      : "Add delivery instructions";

    return (
      <Flex {...styles.deliveryRowContainer} onClick={showDeliveryInstructionsComponent}>
        <Flex {...styles.iconContainer}>
          <Image src={TruckIcon} />
        </Flex>
        <Flex {...styles.detailsContainer}>
          <Flex {...styles.deliveryDetailsTextContainer}>
            <Text {...styles.deliveryDetailsRowText}>Delivery Instructions</Text>
            <Text {...styles.deliveryDetailsRowSubtext}>{instructionsDisplay}</Text>
          </Flex>
          <Image src={RightChevronIcon} />
        </Flex>
      </Flex>
    );
  };

  /**
   * Render payment information
   */
  const renderPaymentDetails = () => {
    return (
      <>
        <Flex {...styles.sectionHeader}>
          <Text>Payment</Text>
        </Flex>
        {renderSelectedPaymentMethod()}
      </>
    );
  };

  /**
   * Render the row containing the selected payment method
   */
  const renderSelectedPaymentMethod = () => {
    return (
      <Flex {...styles.deliveryRowContainer} onClick={showPaymentMethodComponent}>
        <Flex {...styles.iconContainer}>
          <Image
            pr={"13px"}
            width={"48px"}
            src={getCreditCardBrandIcon(selectedPaymentMethodDetails?.brand)}
          />
        </Flex>
        <Flex {...styles.detailsContainer}>
          <Flex {...styles.deliveryDetailsTextContainer}>
            <Text {...styles.deliveryDetailsRowText}>Payment Method</Text>
            <Text {...styles.deliveryDetailsRowSubtext}>
              •••• {selectedPaymentMethodDetails?.last4}
            </Text>
          </Flex>
          <Image src={RightChevronIcon} />
        </Flex>
      </Flex>
    );
  };

  /**
   * Render the footer, including delivery total, total due, and submit button
   */
  const renderFooter = () => {
    return (
      <>
        {loading && <Loader />}
        <Flex {...styles.sectionHeader}>
          <Text>Delivery Summary</Text>
        </Flex>
        {/* Commenting this out until better order balance decision is made */}
        {/* <Flex {...styles.deliveryBalanceContainer}>
          <Flex {...styles.deliveryBalanceRow}>
            <Text {...styles.deliveryBalanceText}>Add Delivery</Text>
            <Text {...styles.deliveryBalanceText}>
              {deliveryEstimatePrice > 0
                ? `$${deliveryEstimatePrice.toFixed(2)}`
                : deliveryEstimatePrice == 0
                ? "FREE"
                : "Confirm details above"}
            </Text>
          </Flex>
          <Flex {...styles.deliveryBalanceRow}>
            <Text {...styles.orderBalanceText}>Order Balance (PAID)</Text>
            <Text {...styles.orderBalanceText}>
              ${(order.netOrderTotal - order.balanceDue).toFixed(2)}
            </Text>
          </Flex>
        </Flex> */}
        <Flex {...styles.totalDueContainer}>
          <Flex {...styles.totalDueRow}>
            {/* Commenting this out until better order balance decision is made */}
            {/* <Text {...styles.totalDueText}>Total Due</Text>
            <Text {...styles.totalDueText}>${getBalanceDue()}</Text> */}
            <Text {...styles.deliveryBalanceText}>Add Delivery</Text>
            <Text {...styles.deliveryBalanceText}>
              {deliveryEstimatePrice > 0
                ? `$${deliveryEstimatePrice.toFixed(2)}`
                : Number(deliveryEstimatePrice) === 0
                ? "FREE"
                : "Confirm details above"}
            </Text>
          </Flex>
          <Flex {...styles.confirmAndPayRow}>
            <Button
              sx={{
                backgroundColor: disableSubmitButton() ? "BACKGROUND_GREY" : "#3790F4",
                borderRadius: 23.48,
                width: "100%",
              }}
              py={15}
              disabled={disableSubmitButton()}
              onClick={() => {
                if (deliveryProvider === "OWN_DRIVER") {
                  determineDeliveryPipeline();
                } else {
                  setShowDeliveryTipModal(true);
                }
              }}
            >
              CONFIRM
            </Button>
          </Flex>
        </Flex>
      </>
    );
  };

  /**
   * Show the DeliveryAddress component and hide the DeliveryOverview component
   */
  const showDeliveryAddressComponent = () => {
    setShowDeliveryAddress(true);
    setShowDeliveryOverview(false);
  };

  /**
   * Show the DeliveryTime component and hide the DeliveryOverview component
   */
  const showDeliveryTimeComponent = () => {
    if (!deliveryAddressObject) {
      toast.error(<ToastError message={"Please select an address first"} />);
    } else {
      setShowDeliveryTime(true);
      setShowDeliveryOverview(false);
    }
  };

  /**
   * Show the DeliveryInstructions component and hide the DeliveryOverview component
   */
  const showDeliveryInstructionsComponent = () => {
    if (!deliveryAddressObject) {
      toast.error(<ToastError message={"Please select an address first"} />);
    } else {
      setShowDeliveryInstructions(true);
      setShowDeliveryOverview(false);
    }
  };

  /**
   * Set the parameters around when submit button is disabled
   */
  const disableSubmitButton = () => {
    return !deliveryProvider || !deliveryTime || !deliveryAddressObject;
  };

  /**
   * If the customer has payment methods on file:
   *
   * 1) show the PaymentMethodList component
   * 2) hide the DeliveryOverview component
   *
   * If the customer does not have any payment methods on file:
   *
   * 1) show the AddPaymentMethod component
   * 2) hide the DeliveryOverview component
   */
  const showPaymentMethodComponent = () => {
    const paymentMethods = order.paymentMethods;
    if (paymentMethods.length > 0) {
      setShowPaymentMethodListScreen(true);
    } else {
      setShowPaymentMethodScreen(true);
    }

    setShowDeliveryOverview(false);
  };

  /**
   * Store the delivery time windows info in state and format the delivery display time
   *
   * @param {Object} timeDetails
   */
  const saveDeliveryTime = (timeDetails) => {
    setDeliveryEstimate(timeDetails.thirdPartyDeliveryId);
    setDeliveryEstimatePrice(timeDetails.totalDeliveryCost);
    setDeliveryTime(timeDetails.deliveryWindow);
    setDeliveryProvider(timeDetails.deliveryProvider);
    setUberPickupAt(timeDetails.pickupAt);
    setTimingsId(timeDetails.timingsId);

    const readableDeliveryTime = generateHumanReadableDeliveryWindow(
      timeDetails.deliveryWindow,
      order?.store?.timeZone
    );

    setDeliveryDisplayTime(readableDeliveryTime);

    setShowDeliveryTime(false);
    setShowDeliveryOverview(true);
  };

  /**
   * Save the customer phone number to their profile and update state accordingly
   *
   * @param {String} phoneNumber
   */
  const savePhoneNumber = async (phoneNumber) => {
    const data = {
      phoneNumber,
      centsCustomerId: order.customer.centsCustomerId,
    };

    await updateCustomerPhoneNumber(data);

    setShowCustomerPhoneNumberSection(false);
    setShowDeliveryOverview(true);
  };

  /**
   * Save the delivery instructions for the customer address
   *
   * @param {Object} instructionsData
   */
  const saveCustomerDeliveryInstructions = async (instructionsData) => {
    try {
      setLoading(true);

      const data = {
        customerAddressId: deliveryAddressObject.id,
        instructions: instructionsData.instructions,
        leaveAtDoor: instructionsData.leaveAtDoor,
      };

      const deliveryInstructionsData = await saveDeliveryInstructions(data);

      setDeliveryAddressObject(
        deliveryInstructionsData?.data?.addressDetails?.customerAddress
      );

      setShowDeliveryInstructions(false);
      setShowDeliveryOverview(true);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error?.response?.data?.error || error?.message);
    }
  };

  // /**
  //  * Validate an uber delivery can be placed for an address by generating an estimate for the delivery
  //  *
  //  * @param {Array} deliveryTimeArray
  //  * @param {String} deliveryPlacesId
  //  */
  // const validateUberServiceability = useCallback(
  //   async (deliveryTimeArray, deliveryPlacesId) => {
  //     try {
  //       setLoading(true);
  //       const data = {
  //         storeId: order.store.id,
  //         uberToken: uberAuthToken,
  //         dropoffId: deliveryPlacesId,
  //         deliveryTimes: deliveryTimeArray,
  //       };
  //       const estimateResponse = await getDeliveryEstimate(data);

  //       if (estimateResponse?.data?.estimateId) {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     } catch (error) {
  //       setLoading(false);
  //       return false;
  //     }
  //   },
  //   [order, uberAuthToken]
  // );

  /**
   * Verify the selected address is servicable
   *
   * TODO:
   *
   * 1) determine if zip code is in servicable own driver settings
   * 2) determine if the zip code can be handled by doordash
   *
   */
  const validateServiceabilityOfAddress = useCallback(
    async (address) => {
      try {
        setLoading(true);

        const {postalCode: zipCode} = address || {};
        const ownDeliveryData = await fetchOwnDriverSettings({zipCode});

        const serviceableByOwnNetwork = ownDeliveryData?.active;
        const serviceableByDoorDash =
          onDemandDeliverySettings?.active &&
          (onDemandDeliverySettings?.doorDashEnabled ||
            doordashStores?.includes(order?.store?.id.toString()));

        if (serviceableByOwnNetwork || serviceableByDoorDash) {
          setOwnDriverDeliverySettings(ownDeliveryData);
          return saveAddressSelection(address);
        } else {
          setShowDeliveryAddress(false);
          setShowDeliveryOverview(true);
          toast.error(
            <ToastError
              message={`${order.store.name} cannot deliver to this address. Please choose a different address`}
            />
          );
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        toast.error(
          <ToastError
            message={"Something went wrong while checking for address serviceability"}
          />
        );
        console.log(error?.response?.data?.error);
      } finally {
        setAddressToValidate();
      }
    },
    [order, doordashStores, onDemandDeliverySettings, fetchOwnDriverSettings]
  );

  /**
   * Save the selected address in state and reset delivery estimate information
   *
   * This function performs the following:
   *
   * 1) saves the address's googlePlacesId in state;
   * 2) saves the entire delivery address object in state;
   * 3) sets the delivery instructions based on that address;
   * 4) resets all of the delivery time/date estimates (since new address has been selected)
   * 5) sets display of component back to DeliveryOverview
   */
  const saveAddressSelection = async (address) => {
    setDeliveryAddress(address.id);
    setDeliveryAddressObject(address);

    setDeliveryEstimate(null);
    setDeliveryEstimatePrice(null);
    setDeliveryTime(null);
    setDeliveryProvider(null);
    setDeliveryDisplayTime(null);
    setTimingsId(null);

    setShowDeliveryAddress(false);
    setShowDeliveryOverview(true);
    setLoading(false);
  };

  /**
   * Store the payment method to the customer's profile and reset list of payment methods
   *
   * @param {Object} paymentMethodData
   */
  const saveNewPaymentMethodForCustomer = async (paymentMethodData) => {
    try {
      setLoading(true);

      const data = {
        payment: {
          provider: "stripe",
          type: paymentMethodData?.payment?.card?.funding,
          token: paymentMethodData?.payment?.id,
        },
        rememberPaymentMethod: paymentMethodData?.rememberPaymentMethod,
        centsCustomerId: order.customer.centsCustomerId,
        address: {
          address1: deliveryAddressObject.address1,
          address2: deliveryAddressObject.address2,
          city: deliveryAddressObject.city,
          firstLevelSubdivisionCode: deliveryAddressObject.firstLevelSubdivisionCode,
          postalCode: deliveryAddressObject.postalCode,
        },
      };

      const newCardResponse = await addCustomerPaymentMethod(data);

      setPaymentMethodList(newCardResponse?.data?.output?.paymentMethods);

      const paymentMethodToSelect = newCardResponse?.data?.output?.paymentMethods.find(
        (pm) => pm.paymentMethodToken === paymentMethodData.payment.id
      );
      setSelectedPaymentMethodDetails(paymentMethodToSelect);

      setShowPaymentMethodScreen(false);
      setShowPaymentMethodListScreen(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        <ToastError
          message={
            error?.response?.data?.error || "Something went wrong while adding your card"
          }
        />
      );
      console.log(error?.response?.data?.error || error?.message);
    }
  };

  /**
   * Based on the delivery provider, return the proper delivery creation function
   *
   * @param {Object} paymentMethodData
   * @param {Boolean} cardOnFile
   */
  const determineDeliveryPipeline = (tip = 0) => {
    if (deliveryProvider === "UBER") {
      return createDeliveryInUber(tip);
    } else if (deliveryProvider === "DOORDASH") {
      return createDeliveryInDoorDash(tip);
    } else {
      return createOwnDeliveryNetworkDelivery();
    }
  };

  /**
   * Create an uber delivery and update the order to reflect new line items and pricing
   *
   * @param {Number} tip
   */
  const createDeliveryInUber = async (tip) => {
    try {
      setLoading(true);

      const data = {
        paymentToken: selectedPaymentMethodDetails.paymentMethodToken,
        centsCustomerId: order.customer.centsCustomerId,
        serviceOrderId: order.orderId,
        storeId: order.store.id,
        estimateId: deliveryEstimate,
        uberToken: uberAuthToken,
        storeCustomerId: order.customer.storeCustomerId,
        address: deliveryAddressObject,
        pickupAt: uberPickupAt,
        deliveryWindow: deliveryTime,
        deliveryProvider,
        timingsId,
        deliveryCost: deliveryEstimatePrice,
        deliveryTip: tip,
      };

      const delivery = await createUberDelivery(data);

      setShowPaymentMethodScreen(false);

      updateOrderDetails(delivery.data.order);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error?.response?.data?.error || error?.message);
    }
  };

  /**
   * Create a DoorDash return delivery and update the order to reflect new line items and pricing
   *
   * @param {Number} tip
   */
  const createDeliveryInDoorDash = async (tip) => {
    try {
      const data = {
        paymentToken: selectedPaymentMethodDetails.paymentMethodToken,
        centsCustomerId: order.customer.centsCustomerId,
        serviceOrderId: order.orderId,
        storeId: order.store.id,
        storeCustomerId: order.customer.storeCustomerId,
        address: deliveryAddressObject,
        deliveryWindow: deliveryTime,
        deliveryProvider,
        timingsId,
        deliveryCost: deliveryEstimatePrice,
        deliveryTip: tip,
      };

      const delivery = await createDoorDashReturnDelivery(data);

      setShowPaymentMethodScreen(false);

      updateOrderDetails(delivery.data.order);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error?.response?.data?.error || error?.message);
    }
  };

  /**
   * Create a delivery via the business's own delivery network
   *
   * @param {Object} paymentMethodData
   * @param {Boolean} cardOnFile
   */
  const createOwnDeliveryNetworkDelivery = async () => {
    try {
      setLoading(true);

      const data = {
        paymentToken: selectedPaymentMethodDetails.paymentMethodToken,
        centsCustomerId: order.customer.centsCustomerId,
        serviceOrderId: order.orderId,
        storeId: order.store.id,
        storeCustomerId: order.customer.storeCustomerId,
        address: deliveryAddressObject,
        deliveryWindow: deliveryTime,
        deliveryProvider,
        timingsId,
        deliveryCost: deliveryEstimatePrice,
      };

      const ownDeliveryData = await createOwnNetworkReturnDelivery(data);
      updateOrderDetails(ownDeliveryData.data.order);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error?.response?.data?.error || error?.message);
    }
  };

  // /**
  //  * Determine the balance due based on whether delivery has been selected
  //  */
  // const getBalanceDue = () => {
  //   let balanceDue = Number(order.balanceDue);

  //   if (deliveryEstimatePrice) {
  //     balanceDue = +(balanceDue + Number(deliveryEstimatePrice));
  //   }

  //   return balanceDue.toFixed(2);
  // };

  const onSelectAddress = async (address) => {
    setAddressToValidate(address);
  };

  // useEffects here. Please don't change the order.

  /**
   * Before everything get's mounted
   * 1. Get Own Delivery Settings.
   * 2. Get uber authentication and store delivery settings on authentication(Is it required?)
   * 3. Set pickup address from pickup if available as address to be validated.
   */
  useEffect(() => {
    (async () => {
      if (order && !mounted.current) {
        const onDemandSettings = await fetchOnDemandSettings();
        setOnDemandDeliverySettings(onDemandSettings);
        // Note: Is this required after doordash?
        authenticateWithUber();

        const pickupAddress = (order?.customer?.addresses || []).find(
          (address) => address?.id === order?.pickup?.centsCustomerAddressId
        );
        if (pickupAddress) {
          setAddressToValidate(pickupAddress);
        }
      }
    })();
  }, [order, fetchOnDemandSettings]);

  /**
   * If there is address to be validated, use that address
   */
  useEffect(() => {
    if (addressToValidate) {
      validateServiceabilityOfAddress(addressToValidate);
    }
  }, [addressToValidate, validateServiceabilityOfAddress]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <Flex {...styles.screenContainer}>
      <Flex {...styles.screenWrapper}>
        {loading ||
        deliverySettingsLoading.ownDriver ||
        deliverySettingsLoading.onDemand ? (
          <Loader />
        ) : null}
        {showDeliveryOverview && (
          <Box>
            <Box>{renderHeader()}</Box>
            <Box>{renderDeliveryImage()}</Box>
            <Box height={window.innerHeight * 0.4}>
              {renderDeliveryDetails()}
              {renderPaymentDetails()}
              {renderFooter()}
            </Box>
          </Box>
        )}
        {showDeliveryAddress && (
          <Box>
            <DeliveryAddress
              goBack={() => {
                setShowDeliveryAddress(false);
                setShowDeliveryOverview(true);
              }}
              onSave={(address) => {
                onSelectAddress(address);
              }}
              customer={order.customer}
              address={deliveryAddress}
            />
          </Box>
        )}
        {showDeliveryTime && (
          <Box>
            <DeliveryTime
              goBack={() => {
                setShowDeliveryTime(false);
                setShowDeliveryOverview(true);
              }}
              onSave={(timeDetails) => {
                saveDeliveryTime(timeDetails);
              }}
              customer={order?.customer}
              ownDriverDeliverySettings={ownDriverDeliverySettings}
              onDemandDeliverySettings={onDemandDeliverySettings}
              store={order?.store}
              deliveryWindow={deliveryTime}
              deliveryProvider={deliveryProvider}
              address={deliveryAddressObject}
              deliveryEstimate={deliveryEstimate}
              deliveryEstimateCost={deliveryEstimatePrice}
            />
          </Box>
        )}
        {showCustomerPhoneNumberSection && (
          <Box>
            <CustomerPhoneNumber
              goBack={() => {
                setShowCustomerPhoneNumberSection(false);
                setShowDeliveryOverview(true);
              }}
              onSave={savePhoneNumber}
              customer={order.customer}
            />
          </Box>
        )}
        {showDeliveryInstructions && (
          <Box>
            <DeliveryInstructions
              goBack={() => {
                setShowDeliveryInstructions(false);
                setShowDeliveryOverview(true);
              }}
              address={deliveryAddressObject}
              onSave={(instructionsData) => {
                saveCustomerDeliveryInstructions(instructionsData);
              }}
              onSkip={() => {
                setShowDeliveryInstructions(false);
                setShowDeliveryOverview(true);
              }}
            />
          </Box>
        )}
        {showPaymentMethodScreen && (
          <Box>
            <Elements stripe={stripePromise}>
              <AddPaymentMethod
                goBack={() => {
                  setShowPaymentMethodScreen(false);
                  setShowDeliveryOverview(true);
                }}
                onSave={(paymentMethodData) => {
                  saveNewPaymentMethodForCustomer(paymentMethodData);
                }}
              />
            </Elements>
          </Box>
        )}
        {showDeliveryTipModal && (
          <AddDeliveryTip
            deliveryTip={deliveryTip}
            onAddDeliveryTip={(tip) => {
              setLoading(true);
              determineDeliveryPipeline(tip);
            }}
          />
        )}
        {showPaymentMethodListScreen && (
          <Box>
            <Elements stripe={stripePromise}>
              <PaymentMethodList
                onClose={() => {
                  setShowPaymentMethodListScreen(false);
                  setShowDeliveryOverview(true);
                }}
                customer={order.customer}
                onSave={(paymentMethodData) => {
                  setSelectedPaymentMethodDetails(paymentMethodData);
                  setShowPaymentMethodListScreen(false);
                  setShowDeliveryOverview(true);
                }}
                paymentMethod={selectedPaymentMethodDetails}
                order={order}
                paymentMethodList={paymentMethodList}
                onNewPaymentMethod={() => {
                  setShowPaymentMethodListScreen(false);
                  setShowDeliveryOverview(false);
                  setShowPaymentMethodScreen(true);
                }}
              />
            </Elements>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

const styles = {
  screenContainer: {
    sx: {
      fontFamily: "inherit",
      height: window.innerHeight,
      justifyContent: "flex-start",
      alignItems: "center",
      flexDirection: "column",
    },
  },
  screenWrapper: {
    width: ["100%", "100%", "100%", "75%", "50%"],
    flexDirection: "column",
  },
  headerRowContainer: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      height: window.innerHeight * 0.1,
    },
  },
  headerRowText: {
    sx: {
      fontSize: 18,
      fontWeight: 600,
    },
  },
  svgImage: {
    sx: {
      position: "absolute",
      left: 20,
    },
  },
  headerColumnContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "auto",
    },
  },
  deliveryRowContainer: {
    sx: {
      flexDirection: "row",
      borderBottom: "1px solid",
      borderColor: "BOX_BORDER",
      width: "100%",
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 15,
      paddingBottom: 15,
    },
  },
  iconContainer: {
    sx: {
      width: "15%",
      alignItems: "center",
      justifyContent: "flex-start",
    },
  },
  deliveryDetailsTextContainer: {
    sx: {
      flexDirection: "column",
    },
    py: "10px",
  },
  deliveryDetailsRowText: {
    sx: {
      fontSize: 18,
      fontWeight: 300,
    },
    py: "4px",
  },
  deliveryDetailsRowSubtext: {
    sx: {
      fontSize: "12px",
      fontFamily: "secondary",
      color: "TEXT_GREY",
    },
    py: "4px",
  },
  detailsContainer: {
    sx: {
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
    },
  },
  footerContainer: {
    sx: {
      alignItems: "center",
      justifyContent: "flex-end",
      height: window.innerHeight * 0.5,
      flexDirection: "column",
    },
  },
  deliveryBalanceContainer: {
    sx: {
      borderTop: "1px solid",
      borderBottom: "1px solid",
      borderColor: "BOX_BORDER",
      alignItems: "flex-start",
      justifyContent: "space-between",
      flexDirection: "column",
      width: "100%",
    },
    py: 15,
  },
  deliveryBalanceRow: {
    sx: {
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: 10,
      flexDirection: "row",
      width: "100%",
    },
  },
  deliveryBalanceText: {
    sx: {
      color: "CENTS_BLUE",
      fontWeight: 600,
    },
  },
  orderBalanceText: {
    sx: {
      color: "BLACK",
      fontWeight: 600,
    },
  },
  totalDueContainer: {
    sx: {
      alignItems: "flex-start",
      justifyContent: "flex-start",
      width: "100%",
      flexDirection: "column",
    },
    py: 15,
  },
  totalDueRow: {
    sx: {
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: 10,
      flexDirection: "row",
      width: "100%",
    },
  },
  totalDueText: {
    sx: {
      color: "SUCCESS_TEXT_GREEN",
      fontWeight: 600,
      fontSize: 20,
    },
  },
  confirmAndPayRow: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
      padding: 10,
      flexDirection: "row",
      width: "100%",
    },
  },
  sectionHeader: {
    p: "20px 18px",
    bg: "rgb(234, 241, 250)",
    fontSize: "14px",
  },
  mainImageContainer: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
    },
  },
};

export default DeliveryOverview;
