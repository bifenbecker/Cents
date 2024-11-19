import React from "react";
import {Flex, Text, Button} from "rebass/styled-components";

// Components
import DockModal from "../common/DockModal";

const CancelDelivery = props => {
  const {showCancellationModal, toggleModal, loading, onCancel} = props;

  return (
    <DockModal
      isOpen={showCancellationModal}
      toggle={() => {
        toggleModal(!showCancellationModal);
      }}
      loading={loading}
      showExitIcon={true}
    >
      <Flex {...styles.cancellationModalContainer}>
        <Flex {...styles.cancellationDisclaimerContainer}>
          <Text textAlign="center" {...styles.headerRowText}>
            Are you sure you want to cancel your delivery?
          </Text>
          <Text {...styles.cancellationDisclaimerText}>
            You will have the opportunity to reschedule the delivery or choose to pick it
            up in-store.
          </Text>
        </Flex>
        <Flex {...styles.cancellationButtonContainer}>
          <Button
            sx={{
              backgroundColor: "#3790F4",
              borderRadius: 23.48,
              width: "100%",
            }}
            py={15}
            onClick={() => {
              onCancel();
            }}
          >
            CANCEL DELIVERY
          </Button>
        </Flex>
      </Flex>
    </DockModal>
  );
};

const styles = {
  cancellationModalContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      height: "80%",
    },
    py: "10px",
  },
  cancellationDisclaimerContainer: {
    sx: {
      flexDirection: "column",
    },
    width: "70%",
    pt: "50px",
  },
  cancellationDisclaimerText: {
    sx: {
      textAlign: "center",
      fontSize: "12px",
    },
    py: "30px",
  },
  cancellationButtonContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "80%",
    },
  },
};

export default CancelDelivery;
