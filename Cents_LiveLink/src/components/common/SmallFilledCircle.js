import React from "react";
import PropTypes from "prop-types";
import {Box} from "rebass/styled-components";

const SmallFilledCircle = ({color = "CENTS_BLUE", size = "10px", ...rest}) => {
  return <Box {...styles} bg={color} height={size} width={size} {...rest} />;
};

const styles = {
  height: "10px",
  width: "10px",
  sx: {
    borderRadius: "100%",
  },
};

SmallFilledCircle.propTypes = {
  color: PropTypes.string,
  size: PropTypes.string,
};

export default SmallFilledCircle;
