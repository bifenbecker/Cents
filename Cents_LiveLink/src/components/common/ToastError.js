import React from "react";
import PropTypes from "prop-types";
import {Flex, Image, Text} from "rebass/styled-components";

// Assets
import {ErrorExclamationIcon} from "../../assets/images";

const ToastError = props => {
  return (
    <Flex style={{alignItems: "center", justifyContent: "flex-start"}}>
      <Image pr={"6px"} src={ErrorExclamationIcon} />
      <Text>{props.message}</Text>
    </Flex>
  );
};

ToastError.propTypes = {
  message: PropTypes.any.isRequired,
};

export default ToastError;
