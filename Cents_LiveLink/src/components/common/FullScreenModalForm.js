import React from "react";
import {Box, Button, Flex, Image, Text} from "rebass/styled-components";
import PropTypes from "prop-types";

import {ExitIcon} from "../../assets/images";

import Loader from "./loader";

const FullScreenModalForm = props => {
  const {
    onClose,
    header,
    btnLabel,
    footerBtnStyles,
    bodyStyle,
    children,
    onSubmit,
    disabled,
    loading,
  } = props;

  return (
    <Flex {...styles.wrapper}>
      <Image {...styles.closeIcon} src={ExitIcon} onClick={onClose} alt="Modal Close" />
      <Flex {...styles.header.wrapper}>
        <Text {...styles.header.text}>{header}</Text>
      </Flex>
      <Box {...styles.body.wrapper}>
        {loading && <Loader style={{height: "calc(var(--app-height) - 67px )"}} />}
        <Box {...styles.body.content} {...bodyStyle}>
          {children}
        </Box>
      </Box>
      <Flex {...styles.footer.wrapper}>
        <Button
          variant="primary"
          {...styles.footer.button}
          {...footerBtnStyles}
          onClick={onSubmit}
          disabled={disabled}
        >
          {btnLabel}
        </Button>
      </Flex>
    </Flex>
  );
};

const styles = {
  wrapper: {
    height: "var(--app-height)",
    flexDirection: "column",
    sx: {
      position: "relative",
    },
  },
  header: {
    wrapper: {
      alignItems: "center",
      justifyContent: "center",
      height: "67px",
      sx: {
        borderBottom: "1px solid",
        borderColor: "SEPERATOR_GREY",
      },
    },
    text: {
      fontSize: ["1.25rem", "1.5rem"],
    },
  },
  closeIcon: {
    height: "20px",
    width: "20px",
    sx: {
      position: "absolute",
      top: "1.5rem",
      left: "1.5rem",
      cursor: "pointer",
    },
  },
  body: {
    wrapper: {
      sx: {
        position: "relative",
      },
      height: "calc(var(--app-height) - 67px - 6rem)",
    },
    content: {
      p: "2rem",
      height: "calc(var(--app-height) - 67px - 6rem)",
      pb: 0,
    },
    pb: 0,
  },
  footer: {
    wrapper: {
      mt: "auto",
      height: "4rem",
      px: "2rem",
      alignItems: "center",
      justifyContent: "center",
      mb: "2rem",
    },
    button: {
      width: ["100%", "100%", "100%", "50%"],
      height: ["3.5rem", "4rem"],
      fontSize: [3, 4],
    },
  },
};

FullScreenModalForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  btnLabel: PropTypes.string,
  footerBtnStyles: PropTypes.object,
  bodyStyle: PropTypes.object,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

FullScreenModalForm.defaultProps = {
  btnLabel: "Apply",
  footerBtnStyles: {},
  bodyStyle: {},
  disabled: false,
  loading: false,
};

export default FullScreenModalForm;
