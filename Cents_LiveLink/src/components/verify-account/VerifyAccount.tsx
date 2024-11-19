import React, {useEffect, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import {toast} from "react-toastify";
import get from "lodash/get";

import {ExitIcon} from "../../assets/images";

import {getQueryString, convertToQueryString} from "../../utils/common";
import {authenticateOrder} from "../../api";

import {Loader} from "../common";
import VerifyUser from "./VerifyUser";
import ToastError from "../common/ToastError";
import handleAuthorizationAsAdmin from "../../utils/authorize-admin";
import getToken from "../../utils/get-token";
import VerifyAccountForm from "./VerifyAccountForm";
import {OTPResponse} from "./types";
import customerState from "../../state/customer";

const VerifyAccount = () => {
  const {search} = useLocation();
  const history = useHistory();
  const {destination: encodedDestination, orderToken, ...restOfSearch} = getQueryString(
    search
  );
  const destination = encodedDestination
    ? decodeURIComponent(encodedDestination as string)
    : null;

  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [error, setError] = useState("");
  const [OTP, setOTP] = useState("");
  const [storeId, setStoreId] = useState<number | null>(null);
  const [businessId, setBusinessId] = useState(null);

  // commenting this out for later use in self-serve flow
  // redirect to default page if customerAuthToken is in state
  // const customerAuthToken = customerState.customerAuthToken.get();
  // useEffect(() => {
  //   if (customerAuthToken) {
  //     history.push("/");
  //   }
  // }, [customerAuthToken, history]);

  useEffect(() => {
    if (orderToken) {
      getToken();
    }
    handleAuthorizationAsAdmin(businessId);
  }, [businessId, orderToken]);

  const verifyUser = () => {
    setShowOTPScreen(true);
    setIsVerifiedUser(true);
  };

  useEffect(() => {
    if (orderToken) {
      (async () => {
        try {
          setLoading(true);
          const {data} = await authenticateOrder(orderToken);
          setStoreId(data?.storeId);
          setPhoneNumber(data?.phoneNumber);
          setBusinessId(data?.businessId);
        } catch (error) {
          // This means, that the order token is not valid or expired.
          // Remove the order token from the URL.
          history.push("/verify-account");
          // If the order token is expired and the page is not reloaded,
          // then we should still not show OTP screen.
          setShowOTPScreen(false);
          toast.error(
            <ToastError
              message={get(error, "response.data.error", "Order token is not valid")}
            />
          );
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [orderToken, history]);

  const handleBackClickOnOTPScreen = () => {
    setError("");
    setShowOTPScreen(false);
  };

  const moveToBusinessPage = () => {
    history.push(`order/business/${businessId}`);
  };

  const onSuccess = (customerRes: OTPResponse) => {
    const {latestOrderToken} = customerRes;
    if (businessId && !(orderToken || latestOrderToken)) {
      history.push(`/order/business/${businessId}/new`);
    } else if (destination && destination !== "/") {
      history.push({
        pathname: destination,
        search: orderToken ? "" : convertToQueryString(restOfSearch),
      });
      // This is for backwards compatibility
    } else if (orderToken || latestOrderToken) {
      history.push(`/order-summary/${orderToken || latestOrderToken}`);
    } else {
      history.push("/");
    }
  };

  return (
    <>
      {loading && <Loader />}
      <Box {...styles.absoluteElements} />
      <Flex {...styles.header.wrapper}>
        {showOTPScreen ? (
          <>
            {!orderToken && (
              <Image
                src={ExitIcon}
                {...styles.header.icon}
                onClick={handleBackClickOnOTPScreen}
              />
            )}
          </>
        ) : (
          <>
            {businessId && (
              <Image
                src={ExitIcon}
                {...styles.header.icon}
                onClick={moveToBusinessPage}
              />
            )}
          </>
        )}
        <Text {...styles.header.text}>Verify Account</Text>
      </Flex>
      <Flex {...styles.body}>
        {orderToken && !isVerifiedUser ? (
          <VerifyUser
            phoneNumber={phoneNumber}
            storeId={storeId}
            onConfirmation={verifyUser}
            setOTP={setOTP}
            setLoading={setLoading}
          />
        ) : (
          <VerifyAccountForm
            onSuccess={onSuccess}
            setLoading={setLoading}
            setError={setError}
            showOTPScreen={showOTPScreen}
            setShowOTPScreen={setShowOTPScreen}
            OTP={OTP}
            setOTP={setOTP}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            businessId={businessId}
            storeId={storeId}
          />
        )}

        {error ? <Text variant="errorMessage">{error}</Text> : null}
      </Flex>
    </>
  );
};

export default VerifyAccount;

const styles = {
  absoluteElements: {
    sx: {
      overflow: "hidden",
      position: "absolute",
      inset: 0,
      zIndex: "-1",
      "&:before": {
        content: "''",
        position: "absolute",
        width: ["450px", "450px", "450px", "640px"],
        height: ["450px", "450px", "450px", "640px"],
        bg: "#3d98ff",
        top: "50px",
        right: ["-200px", "-200px", "-200px", "-310px"],
        borderRadius: "50vh",
        opacity: 0.1,
        zIndex: -1,
      },
      "&:after": {
        content: "''",
        position: "absolute",
        width: ["250px", "250px", "250px", "400px"],
        height: ["250px", "250px", "250px", "400px"],
        border: "3px solid #2940A0",
        bottom: ["-100px", "-100px", "-100px", "-170px"],
        left: ["-150px", "-150px", "-150px", "-200px"],
        borderRadius: "50vh",
        opacity: 0.6,
        zIndex: -1,
      },
    },
  },
  wrapper: {
    height: "var(--app-height)",
    flexDirection: "column" as any,
    sx: {
      position: "relative",
    },
  },
  header: {
    wrapper: {
      alignItems: "center" as any,
      justifyContent: "center" as any,
      sx: {
        position: "absolute",
        top: "20px",
      },
      mx: "auto",
      width: "100%",
    },
    text: {
      fontSize: ["1rem", "1.25rem"],
      sx: {
        fontWeight: 700,
      },
    },
    icon: {
      sx: {
        position: "absolute",
        left: "20px",
      },
    },
  },
  body: {
    height: "100%",
    p: "2rem",
    flexDirection: "column" as any,
    alignItems: ["center", "center", "center"],
    justifyContent: "center" as any,
  },
};
