import React, {useState} from "react";
import {Flex, Text} from "rebass/styled-components";

import {DockModal} from "../common";
import VerifyAccountForm from "./VerifyAccountForm";
import {ITheme} from "../../types/theme";

interface VerifyUserModalProps {
  isOpen: boolean;
  toggle: (value?: boolean) => void;
  fetchingSubscriptions: boolean;
  onSuccess: () => Promise<void>;
  businessId: number | null;
  storeId: number | null;
  businessTheme: ITheme;
}

const VerifyUserModal = ({
  isOpen,
  toggle,
  fetchingSubscriptions,
  onSuccess,
  businessId,
  storeId,
  businessTheme,
}: VerifyUserModalProps) => {
  const [loading, setLoading] = useState(false);
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const [error, setError] = useState("");
  const [OTP, setOTP] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleBackClickOnOTPScreen = () => {
    setError("");
    if (showOTPScreen) {
      setShowOTPScreen(false);
    } else {
      toggle();
    }
  };

  return (
    <DockModal
      isOpen={isOpen}
      toggle={toggle}
      loading={loading || fetchingSubscriptions}
      size={1}
      fullWidth
      header="Verify Account"
      provideBackOption
      onBackClick={handleBackClickOnOTPScreen}
    >
      <Flex {...styles.layout}>
        <Flex {...styles.main}>
          {businessTheme?.logoUrl ? (
            <Flex {...styles.logo}>
              <img style={styles.logo.image} src={businessTheme.logoUrl} alt="logo" />
            </Flex>
          ) : null}
          <Flex {...styles.content}>
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
            {error ? <Text variant="errorMessage">{error}</Text> : null}
          </Flex>
        </Flex>
      </Flex>
    </DockModal>
  );
};

const styles = {
  layout: {
    height: "calc(100% - 67px)",
    flexDirection: "column" as any,
    px: "25px",
    paddingBottom: "67px",
    justifyContent: "flex-start",
  },
  main: {
    height: "100%",
    width: "100%",
    flexDirection: "column" as any,
    alignItems: "center",
  },
  logo: {
    my: "2rem",
    image: {
      width: 120,
      display: "block",
    },
  },
  content: {
    height: "calc(100% - 10rem)",
    width: "100%",
    justifyContent: "center",
    flexDirection: "column" as any,
    alignItems: "center",
  },
};

export default VerifyUserModal;
