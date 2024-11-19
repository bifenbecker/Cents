import React, {ChangeEvent, useEffect, useState} from "react";
import {Flex, Text, Button, Image} from "rebass/styled-components";
import {onlineOrderState} from "../../state/online-order";

import MaskedInput from "../common/MaskedInput";
import {OTP_CODE_LENGTH} from "../../constants/constants";
import {IllustrationPhoneOTP} from "../../assets/images";
import {formatAsUSAPhoneNumber} from "../../utils/formatAsUSAPhoneNumber/formatAsUSAPhoneNumber";
import {extractOtpCode} from "./extractOtpCode";

interface OtpScreenProps {
  phoneNumber: string;
  onSubmit: (otpCode: string) => void;
  requestOtp: () => void;
  otpCode: string;
}

const OtpScreen = ({phoneNumber, onSubmit, requestOtp, otpCode}: OtpScreenProps) => {
  const isAuthorized = onlineOrderState.isAuthorized.get();
  const [otp, setOtp] = useState(isAuthorized ? otpCode : "");

  const setOtpValue = (value: string) => {
    const otpCode = extractOtpCode(value);
    setOtp(otpCode);

    // Only trigger onSubmit if the prev otp value is not 6.
    if (otp.length !== OTP_CODE_LENGTH && otpCode.length === OTP_CODE_LENGTH) {
      onSubmit(otpCode);
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      requestOtp();
    }
  }, [isAuthorized, requestOtp]);

  const onHandleInputChange = ({target: {value}}: ChangeEvent<HTMLInputElement>) => {
    if (isAuthorized) {
      console.log(value);
    } else {
      setOtpValue(value);
    }
  };

  return (
    <Flex {...styles.layout.main}>
      <Flex {...styles.layout.firstPart}>
        <Image src={IllustrationPhoneOTP} {...styles.layout.firstPart.image} />
      </Flex>
      <Flex {...styles.layout.secondPart}>
        {isAuthorized ? (
          <Text mb="12px" textAlign="center" {...styles.content}>
            Please click submit to order on behalf of customer.
          </Text>
        ) : (
          <Text mb="12px" textAlign="center" {...styles.content}>
            Enter the 6-digit code we sent to&nbsp;{formatAsUSAPhoneNumber(phoneNumber)}
          </Text>
        )}
        <MaskedInput
          onChange={onHandleInputChange}
          value={isAuthorized ? String(otpCode) : otp}
          mask="9  9  9 - 9  9  9"
          type="tel"
        />
        {isAuthorized ? (
          <Button
            variant="primary"
            {...styles.verifiedCustomer.verification.button}
            onClick={() => onSubmit(String(otpCode))}
          >
            SUBMIT CODE
          </Button>
        ) : null}
        {isAuthorized ? null : (
          <Flex {...styles.resendOtp.wrapper}>
            <Text variant="link" {...styles.resendOtp.text} onClick={requestOtp}>
              Send code again
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

const styles = {
  layout: {
    main: {
      flexDirection: "column" as any,
      alignItems: ["center", "center", "center"],
      justifyContent: "flex-start",
      height: "100%",
    },
    firstPart: {
      mb: "4rem",
      mt: "4rem",
      image: {
        height: 180,
      },
    },
    secondPart: {
      flexDirection: "column" as any,
      alignItems: ["center", "center", "center"],
    },
  },
  resendOtp: {
    wrapper: {
      width: "100%",
      justifyContent: ["center", "center", "center", "center"],
    },
    text: {
      mt: "32px",
      fontSize: "16px",
      fontWeight: 500,
    },
  },
  content: {
    fontFamily: "secondary",
    sx: {
      fontSize: 24,
      fontWeight: 700,
    },
  },
  verifiedCustomer: {
    wrapper: {
      width: ["100%", "100%", "100%", "50%"],
      maxWidth: "320px",
      flexDirection: "column",
      mt: "1.5rem",
      alignItems: "center",
      justifyContent: "center",
    },
    verification: {
      wrapper: {
        width: "100%",
        p: "1.25rem",
        my: "1.5rem",
        flexDirection: "column",
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
        px: "24px",
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
};

export default OtpScreen;
