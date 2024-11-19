import React, {useState, useCallback, useEffect, Dispatch, SetStateAction} from "react";
import {toast} from "react-toastify";
import get from "lodash/get";

import {requestOtp, verifyOTP} from "../../api/auth";
import {onlineOrderState} from "../../state/online-order";
import OtpScreen from "./OtpScreen";
import PhoneNumberScreen from "./PhoneNumberScreen";
import {createCustomer} from "../../api/customer";
import useCustomerState from "../../hooks/useCustomerState";
import handleAuthorizationAsAdmin from "../../utils/authorize-admin";
import {AxiosResponse} from "axios";
import {NewCustomer, OTPResponse} from "./types";

export interface VerifyAccountFormProps {
  phoneNumber: string;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  showOTPScreen: boolean;
  setShowOTPScreen: Dispatch<SetStateAction<boolean>>;
  OTP: string;
  setOTP: Dispatch<SetStateAction<string>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
  onSuccess: (customerRes: OTPResponse) => void;
  businessId: number | null;
  storeId: number | null;
}

const VerifyAccountForm = ({
  onSuccess,
  setLoading,
  setError,
  showOTPScreen,
  setShowOTPScreen,
  OTP,
  setOTP,
  phoneNumber,
  setPhoneNumber,
  businessId,
  storeId,
}: VerifyAccountFormProps) => {
  const isAuthorized = onlineOrderState.isAuthorized.get();

  const [newCustomer, setNewCustomer] = useState<NewCustomer | null>(null);

  const {setCustomer, setCustomerAuthToken} = useCustomerState();

  const requestOtpApi = useCallback(async () => {
    setLoading(true);
    try {
      setError("");
      await requestOtp({phoneNumber, storeId, isAuthorized});
      !isAuthorized && toast.success("Code sent!");
    } catch (error) {
      setError(
        get(
          error,
          "response.data.error",
          "Verification code could not be sent. Please try again"
        )
      );
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, phoneNumber, storeId, isAuthorized]);

  const submitOTP = async (otp: string) => {
    setLoading(true);
    try {
      setError("");
      let otpResponse: AxiosResponse<OTPResponse>;

      otpResponse = await verifyOTP({phoneNumber, otp});
      if (otpResponse.data?.isNew && newCustomer) {
        otpResponse = await createCustomer(newCustomer);
      }

      const {customerAuthToken, customer} = otpResponse.data;
      setCustomerAuthToken(customerAuthToken);
      setCustomer(customer);
      await onSuccess(otpResponse.data);
    } catch (error) {
      console.log(error, "error");
      setError(
        get(
          error,
          "response.data.error",
          "Something went wrong while submitting verification code or creating customer"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationLink = (newCustomerData: NewCustomer | null = null) => {
    setNewCustomer(newCustomerData);
    setShowOTPScreen(true);
  };

  useEffect(() => {
    handleAuthorizationAsAdmin(businessId);
  }, [businessId]);

  return (
    <>
      {showOTPScreen ? (
        <OtpScreen
          phoneNumber={phoneNumber}
          onSubmit={submitOTP}
          requestOtp={requestOtpApi}
          otpCode={OTP}
        />
      ) : (
        <PhoneNumberScreen
          onlineOrderBusinessId={businessId}
          setPhoneNumber={setPhoneNumber}
          phoneNumber={phoneNumber}
          onSendVerificationClick={handleSendVerificationLink}
          setLoading={setLoading}
          storeId={storeId}
          setOTP={setOTP}
        />
      )}
    </>
  );
};

export default VerifyAccountForm;
