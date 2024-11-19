import React from "react";
import PropTypes from "prop-types";
import {Box, Flex} from "rebass/styled-components";

const styles = ({color, filled}) => {
  return {
    outer: {
      borderRadius: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderColor: filled ? "primary" : "TEXT_GREY",
      height: "18px",
      width: "18px",
      borderStyle: "solid",
      borderWidth: "2px",
      marginRight: "4px",
      padding: "8px",
    },
    inner: {
      display: filled ? "block" : "none",
      borderRadius: "100%",
      backgroundColor: color,
      height: "10px",
      width: "10px",
      padding: "6px",
    },
  };
};

const ToggleButtonRadioDecoration = ({color = "CENTS_BLUE", filled}) => {
  return (
    <Flex sx={{...styles({color, filled}).outer}} borderColor={color}>
      <Box sx={{...styles({color, filled}).inner}} />
    </Flex>
  );
};

ToggleButtonRadioDecoration.propTypes = {
  color: PropTypes.string,
  filled: PropTypes.bool,
};

export default ToggleButtonRadioDecoration;
