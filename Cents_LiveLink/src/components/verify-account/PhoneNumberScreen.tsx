import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {Box, Button, Flex, Image, Text} from "rebass/styled-components";
import {toast} from "react-toastify";

import phoneNumberScreenTestids from "../../mocks/testids/PhoneNumberScreen.testids";

import {ExitIcon, IllustrationPhone} from "../../assets/images";
import {verifyCustomer} from "../../api/customer";
import {requestOtp} from "../../api/auth";
import {MaskedInput, TextField} from "../common";
import ToastError from "../common/ToastError";
import {onlineOrderState} from "../../state/online-order";
import {useHookstate} from "@hookstate/core";
import {NewCustomer} from "./types";
import {NOT_DIGITS_REGEXP, PHONE_LENGTH} from "../../constants/constants";

interface PhoneNumberScreenProps {
  phoneNumber: string;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setOTP: Dispatch<SetStateAction<string>>;
  storeId: number | null;
  onlineOrderBusinessId: number | null;
  onSendVerificationClick: (newCustomerData: NewCustomer | null) => void;
}

interface VerifiedCustomer {
  firstName: string | null;
  lastName: string | null;
  isVerified: boolean;
}

const PhoneNumberScreen = ({
  onlineOrderBusinessId,
  setPhoneNumber,
  phoneNumber,
  onSendVerificationClick,
  setLoading,
  setOTP,
  storeId,
}: PhoneNumberScreenProps) => {
  const isAuthorized = useHookstate(onlineOrderState.isAuthorized).value;

  const [verifiedCustomer, setVerifiedCustomer] = useState<VerifiedCustomer | null>(null);

  const [{firstName, lastName}, setState] = useState<
    Omit<VerifiedCustomer, "isVerified">
  >({
    firstName: "",
    lastName: "",
  });

  const verifyPhoneNumber = useCallback(
    async (value: string) => {
      try {
        setLoading(true);
        const {data} = await verifyCustomer({phoneNumber: value});
        setVerifiedCustomer(data ?? {});
      } catch (error) {
        toast.error(
          <ToastError
            message={"Could not check your account linked to your phone number"}
          />
        );
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  useEffect(() => {
    if (phoneNumber?.length === PHONE_LENGTH) {
      verifyPhoneNumber(phoneNumber);
    }
  }, [verifyPhoneNumber, phoneNumber]);

  const onPhoneNumberChange = ({target: {value}}: ChangeEvent<HTMLInputElement>) => {
    setVerifiedCustomer(null);
    setState(prevState => ({...prevState, lastName: "", firstName: ""}));
    setPhoneNumber(value.replace(NOT_DIGITS_REGEXP, "").slice(0, PHONE_LENGTH) as string);
  };

  const sendVerificationHandler = async () => {
    onSendVerificationClick(
      verifiedCustomer?.isVerified
        ? null
        : {fullName: `${firstName} ${lastName}`.trim(), phoneNumber}
    );
    if (isAuthorized) {
      setLoading(true);
      try {
        const res = await requestOtp({phoneNumber, storeId, isAuthorized});
        setOTP(res.data.otpCode);
      } catch (error) {
        console.log("err: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onHandleChange = ({
    target: {value, name},
  }: ChangeEvent<HTMLTextAreaElement & HTMLInputElement>) => {
    const trimmedValue = value.trim().replace(/\s+/g, " ");
    setState(prevState => ({...prevState, [name]: trimmedValue}));
  };

  return (
    <>
      <Text fontSize={24} mb={20} textAlign="center">
        What’s your phone number?
      </Text>
      <MaskedInput
        onChange={onPhoneNumberChange}
        value={phoneNumber || ""}
        mask="( 9 9 9 ) 9 9 9 - 9 9 9 9"
        type="tel"
        {...styles.phoneInput}
      />
      {!verifiedCustomer && onlineOrderBusinessId && (
        <Text
          fontFamily="secondary"
          pt="20px"
          px="16px"
          fontSize="16px"
          style={styles.text}
        >
          We’ll only use it to verify your identity and provide updates about your order.
        </Text>
      )}
      {verifiedCustomer && (
        <Flex {...styles.verifiedCustomer.wrapper}>
          {!verifiedCustomer?.isVerified && (
            <>
              <TextField
                label="First Name"
                name="firstName"
                onChange={onHandleChange}
                value={firstName || ""}
                suffix={
                  <Image
                    src={ExitIcon}
                    height="16px"
                    sx={{cursor: "pointer"}}
                    onClick={() => setState(prevState => ({...prevState, lastName: ""}))}
                  />
                }
                materialWrapperStyle={{width: "100%", height: "56px", marginBottom: "4%"}}
                wrapperInputStyle={{fontSize: "18px"}}
                data-testid={phoneNumberScreenTestids.firstNameInput}
              />
              <TextField
                label="Last Name"
                name="lastName"
                onChange={onHandleChange}
                value={lastName || ""}
                suffix={
                  <Image
                    src={ExitIcon}
                    height="16px"
                    sx={{cursor: "pointer"}}
                    onClick={() => setState(prevState => ({...prevState, lastName: ""}))}
                  />
                }
                materialWrapperStyle={{width: "100%", height: "56px"}}
                wrapperInputStyle={{fontSize: "18px"}}
                data-testid={phoneNumberScreenTestids.lastNameInput}
              />
            </>
          )}
          <Flex {...styles.verifiedCustomer.verification.wrapper}>
            <Flex {...styles.verifiedCustomer.verification.text}>
              <Box mr="32px">
                <Text fontSize="18px">
                  {verifiedCustomer?.isVerified
                    ? `Welcome back, ${verifiedCustomer?.firstName}`
                    : "Verify Your Account"}
                </Text>
                <br />
                <Text fontFamily="secondary" fontSize="14px">
                  {verifiedCustomer?.isVerified
                    ? "Verify your account to login"
                    : "We’ll send you a text with a code to create your account."}
                </Text>
              </Box>
              <Image src={IllustrationPhone} flexShrink="0" />
            </Flex>
            <Button
              variant="primary"
              {...styles.verifiedCustomer.verification.button}
              onClick={sendVerificationHandler}
              disabled={
                (!verifiedCustomer?.isVerified && (!firstName || !lastName)) ||
                (isAuthorized ? false : Boolean(isAuthorized))
              }
              data-testid={phoneNumberScreenTestids.sendVerificationButton}
            >
              {isAuthorized ? "SHOW VERIFICATION CODE" : "SEND VERIFICATION CODE"}
            </Button>
          </Flex>
        </Flex>
      )}
    </>
  );
};

const styles = {
  phoneInput: {
    sx: {textAlign: ["center", "center", "center"]},
    fontSize: ["1.5rem", "1.75rem", "2rem"],
    px: 0,
    width: ["100%", "100%", "100%", "75%"],
  },
  verifiedCustomer: {
    wrapper: {
      width: ["100%", "100%", "100%", "50%"],
      maxWidth: "320px",
      flexDirection: "column" as any,
      mt: "1.5rem",
      alignItems: "center",
      justifyContent: "center",
    },
    verification: {
      wrapper: {
        width: "100%",
        p: "1.25rem",
        my: "1.5rem",
        flexDirection: "column" as any,
        bg: "WHITE",
        sx: {
          borderRadius: "24px",
          boxShadow:
            "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
        },
      },
      text: {
        justifyContent: "space-between",
        height: "83px",
        alignItems: "center",
      },
      button: {
        mt: "1rem",
        height: "48px",
        px: "24px",
      },
    },
    disclaimerText: {
      sx: {
        fontFamily: "secondary",
        fontStyle: "italic",
      },
      pt: "20px",
    },
  },
  text: {
    textAlign: "center" as any,
  },
};

export default PhoneNumberScreen;
