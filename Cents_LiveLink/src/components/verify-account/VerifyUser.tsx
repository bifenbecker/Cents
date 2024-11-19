import {Dispatch, SetStateAction} from "react";
import {Flex, Text, Button, Image} from "rebass/styled-components";
import {requestOtp} from "../../api/auth";
import {IllustrationPhoneOTP} from "../../assets/images";
import {useHookstate} from "@hookstate/core";
import {onlineOrderState} from "../../state/online-order";

interface VerifyUserProps {
  phoneNumber: string;
  onConfirmation: () => void;
  setLoading: Dispatch<SetStateAction<boolean>>;
  storeId: number | null;
  setOTP: Dispatch<SetStateAction<string>>;
}

const VerifyUser = ({
  onConfirmation,
  setLoading,
  phoneNumber,
  storeId,
  setOTP,
}: VerifyUserProps) => {
  const isAuthorized = useHookstate(onlineOrderState.isAuthorized).value;

  const onSubmit = async () => {
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
    onConfirmation();
  };

  const phoneLastFourDigits = phoneNumber?.slice(-4);

  return (
    <>
      <Flex {...styles.content}>
        <Image src={IllustrationPhoneOTP} />
        <Text {...styles.commonText}>Making sure it's you</Text>
        <Text {...styles.text} {...styles.commonText}>
          We will send a text with a one time password to *** *** {phoneLastFourDigits}.
        </Text>
      </Flex>
      <Flex {...styles.footer.wrapper}>
        <Button variant="primary" {...styles.footer.button} onClick={onSubmit}>
          {isAuthorized ? "SHOW" : "SEND"} VERIFICATION CODE
        </Button>
      </Flex>
    </>
  );
};

const styles = {
  content: {
    flexDirection: "column" as any,
    alignItems: ["center", "center", "center"],
    justifyContent: "center" as any,
    width: "100%",
    height: "100%",
  },
  text: {
    fontFamily: "secondary",
    sx: {
      fontWeight: "normal",
    },
  },
  footer: {
    wrapper: {
      width: "100%",
      mt: "auto",
      alignItems: "center",
      justifyContent: "center",
      pt: "18px",
    },
    button: {
      width: "100%",
      height: "48px",
      fontSize: "16px",
      sx: {
        textTransform: "uppercase",
      },
    },
  },
  commonText: {
    mb: "12px",
    mt: "12px",
    textAlign: "center" as any,
  },
};

export default VerifyUser;
