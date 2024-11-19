import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {Box, Button, Flex} from "rebass/styled-components";

const ConfirmationPopup = props => {
  const {onCancel, onConfirm, children} = props;

  useEffect(() => {
    // stops the bg scroll when the pop-up is open
    document.querySelector("body").style.overflow = "hidden";
    return () => {
      document.querySelector("body").style.overflow = "visible";
    };
  }, []);

  return (
    <Flex {...styles}>
      <Box>{children}</Box>
      <Box mt="16px">
        <Button variant="outline" mr="10px" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </Box>
    </Flex>
  );
};

ConfirmationPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  children: PropTypes.node,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

ConfirmationPopup.defaultProps = {
  children: "Are you sure you want to do this?",
};

const styles = {
  width: "100%",
  height: "var(--app-height)",
  alignItems: "center",
  justifyContent: "center",
  bg: "rgba(255, 255, 255, 0.5)",
  flexDirection: "column",
  sx: {
    position: "fixed",
    zIndex: "50",
    backdropFilter: "blur(20px)",
  },
};

export default ConfirmationPopup;
