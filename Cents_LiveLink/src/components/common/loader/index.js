import React from "react";
import {Box, Flex, Text} from "rebass/styled-components";
import PropTypes from "prop-types";

const Loader = (props) => {
  return (
    <Flex
      flexDirection="column"
      fontFamily="primary"
      style={{
        height: "var(--app-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.9)",
        position: "absolute",
        zIndex: 999999999,
        top: "0",
        ...props.style,
      }}
      width={props.width || "100%"}
    >
      <div className="spinner">
        <Box className="rect1" bg={props.loaderColor} />
        <Box className="rect2" bg={props.loaderColor} />
        <Box className="rect3" bg={props.loaderColor} />
        <Box className="rect4" bg={props.loaderColor} />
        <Box className="rect5" bg={props.loaderColor} />
      </div>
      <Text mt="1rem" color={props.loaderColor}>
        Loading
      </Text>
    </Flex>
  );
};

Loader.propTypes = {
  loaderColor: PropTypes.string,
  style: PropTypes.object,
};

Loader.defaultProps = {
  style: {},
  loaderColor: "primary",
};

export default Loader;
