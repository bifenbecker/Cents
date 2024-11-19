import React from "react";
import {Flex, Text, Box, Button} from "rebass/styled-components";

import {DockModal} from "../../common";

const ConfirmCancelOrderPopup = ({isOpen, loading, toggle, handleCancelOrder}) => {
  return (
    <DockModal
      fixedSize
      header="Cancel Order"
      isOpen={isOpen}
      size={268}
      loading={loading}
      toggle={toggle}
    >
      <Flex {...styles.wrapper}>
        <Text {...styles.description}>
          Are you sure you want to cancel this order? You will not be able to reactivate
          it.
        </Text>
        <Box {...styles.footer.wrapper}>
          <Text variant="link" onClick={toggle} {...styles.footer.link}>
            Cancel
          </Text>
          <Button onClick={handleCancelOrder} {...styles.footer.button}>
            CONFIRM
          </Button>
        </Box>
      </Flex>
    </DockModal>
  );
};

const styles = {
  description: {
    color: "BLACK",
    fontFamily: "secondary",
  },
  wrapper: {
    marginLeft: "21px",
    marginRight: "18px",
    flexDirection: "column",
    height: "calc(100% - 67px)",
  },
  footer: {
    wrapper: {
      mt: "40px",
    },
    button: {
      height: "56px",
      width: "100%",
      fontSize: ["16px", "18px"],
      mb: "24px",
    },
    link: {
      textAlign: "center",
      mb: ["12px", "24px"],
    },
  },
  error: {
    py: "12px",
    mt: 0,
  },
};

export default ConfirmCancelOrderPopup;
