import React from "react";
import {Button, Flex, Image, Text, Box} from "rebass/styled-components";
import PropTypes from "prop-types";

import {ExitIcon} from "../../assets/images";

import Loader from "./loader";

const ScreenWrapper = props => {
  const {
    error,
    onClose,
    disableSubmit,
    onSubmit,
    submitText,
    loading,
    header,
    children,
    hideFooterButton,
    enableHeaderShadow,
  } = props;

  return (
    <Flex {...styles.main.container}>
      <Flex {...styles.main.wrapper}>
        {loading ? (
          <Loader width={styles.loading.width} style={styles.loading.style} />
        ) : null}
        <Flex
          {...styles.header.wrapper}
          sx={{
            ...styles.header.wrapper.sx,
            boxShadow: enableHeaderShadow ? "0 0 3px rgb(0 0 0 / 25%)" : "none",
          }}
        >
          <Image src={ExitIcon} {...styles.header.image} onClick={onClose} />
          <Text {...styles.header.text}>{header}</Text>
        </Flex>
        <Box
          {...styles.children.container}
          height={
            hideFooterButton
              ? "calc(var(--app-height) - 67px - 16px)"
              : styles.children.container.height
          }
        >
          <Box {...styles.children.wrapper}>{children}</Box>
        </Box>
        {error ? <Text variant="errorMessage">{error}</Text> : null}
        {!hideFooterButton ? (
          <Flex {...styles.footer.wrapper}>
            <Button
              variant="primary"
              {...styles.footer.button}
              disabled={disableSubmit}
              onClick={onSubmit}
            >
              {submitText}
            </Button>
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
};

const styles = {
  // Wrapper Styles.
  main: {
    container: {
      flexDirection: "column",
      height: "calc(var(--app-height))",
      alignItems: "center",
    },
    wrapper: {
      width: ["100%", "100%", "100%", "75%", "50%"],
      flexDirection: "column",
      height: "calc(var(--app-height))",
    },
  },

  // Loader styles
  loading: {
    width: ["100%", "100%", "100%", "75%", "50%"],
    style: {
      zIndex: "999999999",
    },
  },

  // Header styles.
  header: {
    wrapper: {
      height: "67px",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      sx: {
        zIndex: 49,
        position: "sticky",
        top: 0,
      },
    },
    text: {
      fontSize: "18px",
    },
    image: {
      sx: {
        position: "absolute",
        top: "18px",
        left: "18px",
      },
    },
  },

  // Children Styles
  children: {
    container: {
      // total height - header - footer
      height: "calc(var(--app-height) - 67px - 92px)",
      overflow: "auto",
    },
    // Adding some padding as this will give some space between
    // footer and the body
    wrapper: {
      pb: "16px",
    },
  },

  // Footer styles
  footer: {
    wrapper: {
      p: "18px",
      alignItems: "center",
      justifyContent: "center",
      bg: "WHITE",
      sx: {
        zIndex: 49,
        position: "sticky",
        bottom: 0,
        width: "100%",
        boxShadow: "0 0 3px rgba(0, 0, 0, .25)",
        borderTopRightRadius: "6px",
        borderTopLeftRadius: "6px",
      },
    },
    button: {
      p: "18.5px",
      width: "100%",
    },
  },
};

ScreenWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disableSubmit: PropTypes.bool,
  submitText: PropTypes.string,
  error: PropTypes.string,
  hideFooterButton: PropTypes.bool,
  enableHeaderShadow: PropTypes.bool,
};

ScreenWrapper.defaultProps = {
  loading: false,
  disableSubmit: false,
  submitText: "SUBMIT",
  error: null,
  hideFooterButton: false,
  enableHeaderShadow: false,
};

export default ScreenWrapper;
