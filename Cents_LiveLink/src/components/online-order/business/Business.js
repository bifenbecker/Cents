import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useRouteMatch, useHistory} from "react-router-dom";
import {toast} from "react-toastify";
import {withLDConsumer} from "launchdarkly-react-client-sdk";
import {Box, Grid, Typography, useMediaQuery} from "@material-ui/core";

import {FETCHING_STATUS} from "constants/api";

import {useStyles} from "./index.styles";
import {getAvailableOwnDriverOrOnDemandStoreId, getTitleState} from "../utils";
import {onlineOrderSelectors, onlineOrderThunks} from "../redux";
import {BUSINESS_OWNER_AUTH_TOKEN_KEY} from "../../../utils/config";
import getToken from "../../../utils/get-token";
import {useAppDispatch, useAppSelector} from "app/hooks";
import useCustomerState from "../../../hooks/useCustomerState";
import {onlineOrderState} from "../../../state/online-order";

import ServiceSelectionDrawer from "./order-pickup-form/order-details/service-selection-drawer";
import ManageAddresses from "./SearchAddress/ManageAddresses";
import {ImageCard} from "./home/image-card/ImageCard";
import MainLogo from "./MainLogo";
import HomePageButton from "./Button/Button";
import {Layout, ToastError} from "../../common";
import VerifyUserModal from "../../verify-account/VerifyUserModal";

const Business = ({ldClient}) => {
  const {
    data: {businessId, theme: businessTheme, businessSettings, centsCustomerCredentials},
    fetchingStatus: initialDataFetchingStatus,
  } = useAppSelector(onlineOrderSelectors.getOrderInitialData);

  const {
    data: {offersLaundry, offersDryCleaning},
  } = useAppSelector(onlineOrderSelectors.getServiceTypeAvailability);

  const {
    data: {latestOrderDetails},
  } = useAppSelector(onlineOrderSelectors.getNearStoresData);

  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery("(max-width: 500px)");
  const isHeightForOverlapping = useMediaQuery("(max-height: 715px)");
  const mounted = useRef(false);

  const {url} = useRouteMatch();
  const history = useHistory();
  const classes = useStyles();

  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [clickScheduleButton, setClickScheduleButton] = useState(false);
  const {customerAuthToken, clearCustomerDetails} = useCustomerState();
  const [showServiceSelectionDrawer, setShowServiceSelectionDrawer] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isImageCardVisible, setIsImageCardVisible] = useState(true);
  const [storeId, setStoreId] = useState();
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);

  const ENUM_TITLE_STATES = {
    firstVisit: "Start your order",
    greeting: `Welcome back, ${centsCustomerCredentials?.firstName}`,
  };

  // TODO: Clear the files of showExistingSubscriptionsModal and reorderModal

  const fetchCustomerInformation = async (storeId) => {
    try {
      await dispatch(onlineOrderThunks.getCustomerInfo(storeId)).unwrap();
    } catch (error) {
      toast.error(<ToastError message={"Error while fetching customer info"} />);
    }
  };

  const fetchSubscriptionsList = async () => {
    try {
      await dispatch(onlineOrderThunks.getCustomerSubscriptionsList()).unwrap();
    } catch (error) {
      toast.error(<ToastError message={"Error while fetching customer subscriptions"} />);
    }
  };

  /**
   * Register the user in LD so we can evaluate flags based on businessId
   *
   */
  const registerLaunchDarklyUser = () => {
    const user = {
      key: businessId,
      custom: {
        businessId: businessId,
      },
    };
    return ldClient?.identify(user, null, (data) => {
      return data;
    });
  };

  /**
   * Call LD user registration on initialization
   */
  useEffect(() => {
    registerLaunchDarklyUser();
  }, [ldClient]);

  /*
    1. Load Business Auth Token from livelink URL
    2. if we have a business auth token, set the token in session storage. If not, set value as null.
    3. If there is a business auth token, clear customerAuthToken in localstorage.
    4. Enter Address

    5. if no business token, check local storage for customer and if found, use local customer value.
    6. click schedule delivery.

  */
  useEffect(() => {
    if (mounted.current) return;

    getToken();

    const businessOwnerAuthToken = sessionStorage.getItem(BUSINESS_OWNER_AUTH_TOKEN_KEY);

    if (!!businessOwnerAuthToken && businessOwnerAuthToken !== "null") {
      clearCustomerDetails();
      localStorage.removeItem("_grecaptcha");
    }
  }, [clearCustomerDetails]);

  // fetch info that requires customer auth token
  useEffect(() => {
    const handleCustomerAuthenticationTasks = async (storeId) => {
      if (storeId) {
        await fetchCustomerInformation(storeId);
        await determineServiceTypeAvailability(storeId);
      }
    };

    if (customerAuthToken) {
      handleCustomerAuthenticationTasks(storeId).catch(() =>
        toast.error(
          <ToastError
            message={"Something went wrong while fetching customer specific information"}
          />
        )
      );
    }
  }, [businessSettings?.dryCleaningEnabled, customerAuthToken, storeId]);

  useEffect(() => {
    const isOrderHasAction = latestOrderDetails?.actionType;

    if (isOrderHasAction) {
      setIsFirstVisit(false);
    } else {
      setIsFirstVisit(true);
    }
  }, [latestOrderDetails]);

  /**
   * Determine whether laundry and/or dry cleaning are offered at the selected store
   *
   * @param {Number} storeId
   */
  const determineServiceTypeAvailability = async (storeId) => {
    try {
      await dispatch(onlineOrderThunks.getServiceTypesAvailability(storeId)).unwrap();
    } catch (error) {
      toast.error(
        <ToastError
          message={"Something went wrong while fetching service availability"}
        />
      );
    }
  };

  const openDeliveryView = () => {
    history.push(
      `${url[url.length - 1] === "/" ? url.slice(0, url.length - 1) : url}/schedule`
    );
  };

  /**
   * Set the initial service selections in redux
   *
   * @param {Boolean} hasDryCleaning
   * @param {Boolean} hasLaundry
   */
  const saveServiceTypeSelection = () => {
    setShowServiceSelectionDrawer(false);

    if (!customerAuthToken) {
      setShowVerificationScreen(true);
      return;
    }

    openDeliveryView();
  };

  const handleScheduleCardSubmit = useCallback(() => {
    if (businessSettings?.dryCleaningEnabled && offersDryCleaning && offersLaundry) {
      return setShowServiceSelectionDrawer(true);
    }
    if (!customerAuthToken) {
      setShowVerificationScreen(true);
      return;
    }
    openDeliveryView();
  }, [
    customerAuthToken,
    businessSettings?.dryCleaningEnabled,
    offersDryCleaning,
    offersLaundry,
  ]);

  const onSuccessVerification = async () => {
    if (storeId) {
      await fetchCustomerInformation(storeId);
    }
    await fetchSubscriptionsList();
    setShowVerificationScreen(false);
    setClickScheduleButton(true);
  };

  const hasStoresToScheduleOnlineOrder = useMemo(
    () => getAvailableOwnDriverOrOnDemandStoreId(storeId),
    [storeId]
  );

  const handleForceScheduleClick = useCallback(() => {
    if (hasStoresToScheduleOnlineOrder) {
      handleScheduleCardSubmit();
    }
    setClickScheduleButton(false);
  }, [handleScheduleCardSubmit, hasStoresToScheduleOnlineOrder]);

  useEffect(() => {
    if (clickScheduleButton) {
      handleForceScheduleClick();
    }
  }, [clickScheduleButton, handleForceScheduleClick]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <>
      <VerifyUserModal
        isOpen={showVerificationScreen}
        toggle={() => setShowVerificationScreen((state) => !state)}
        fetchingSubscriptions={initialDataFetchingStatus === FETCHING_STATUS.PENDING}
        onSuccess={onSuccessVerification}
        businessId={businessId}
        storeId={storeId}
        businessTheme={businessTheme}
      />
      <Layout isLogoNeeded={false} businessSettings={businessSettings}>
        <Box className={classes.gridWrapper}>
          <Grid className={classes.grid} container spacing={0}>
            <Grid item xs={12}>
              <MainLogo logoUrl={businessTheme?.logoUrl} />
            </Grid>
            <Grid item xs>
              <Box className={classes.homePageTitleWrapper}>
                <Typography className={classes.homePageTitle}>
                  {
                    ENUM_TITLE_STATES[
                      getTitleState(initialDataFetchingStatus, isFirstVisit)
                    ]
                  }
                </Typography>
              </Box>
            </Grid>
            <Grid item className={classes.manageAddressesGrid}>
              <ManageAddresses
                businessId={businessId}
                setIsImageCardVisible={setIsImageCardVisible}
                setStoreId={setStoreId}
                setIsCheckingAddress={setIsCheckingAddress}
                isCheckingAddress={isCheckingAddress}
              />
            </Grid>
            {/* {error && <Text variant="errorMessage">{error}</Text>} */}
            {isImageCardVisible && !isCheckingAddress && (
              <>
                <Grid className={classes.imageCardGrid}>
                  <ImageCard
                    handleReorderButtonClick={openDeliveryView}
                    isFirstVisit={isFirstVisit}
                    orderDetails={latestOrderDetails || {}}
                  />
                </Grid>

                <Grid item className={classes.homePageButtonGrid}>
                  <Box
                    className={[
                      classes.homePageButtonWrapper,
                      isHeightForOverlapping && isMobile
                        ? classes.homePageButtonOverlappingWrapper
                        : null,
                    ]}
                  >
                    <HomePageButton
                      isCheckingAddress={isCheckingAddress}
                      id={"orderBtn"}
                      text={"New order"}
                      onClick={handleScheduleCardSubmit}
                    />
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Layout>
      {showServiceSelectionDrawer && businessSettings?.dryCleaningEnabled ? (
        <ServiceSelectionDrawer
          isOpen={showServiceSelectionDrawer}
          storeCustomerSelections={saveServiceTypeSelection}
        />
      ) : null}
    </>
  );
};

export default withLDConsumer()(Business);
