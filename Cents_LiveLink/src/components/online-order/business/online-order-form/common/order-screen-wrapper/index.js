import React from "react";
import PropTypes from "prop-types";
import {useHistory, useParams} from "react-router-dom";
import {Box, Button, Flex, Image, Text} from "rebass/styled-components";

import {ExitIcon} from "../../../../../../assets/images";

import useToggle from "../../../../../../hooks/useToggle";
import {onlineOrderState} from "../../../../../../state/online-order";

import {Loader} from "../../../../../common";
import ConfirmationPopup from "../confirmation-popup";

const OrderScreenWrapper = (props) => {
  const {
    children,
    header,
    disableBtn,
    submitText,
    onSubmit,
    loading,
    error,
    showPoweredByCents,
    businessId,
  } = props;
  const {businessId: encodedBusinessId} = useParams();
  const history = useHistory();

  const businessIdFromState = onlineOrderState.businessId.get();

  const {isOpen, toggle} = useToggle(false);

  return (
    <>
      {isOpen && (
        <ConfirmationPopup
          isOpen={isOpen}
          onCancel={toggle}
          onConfirm={() => {
            toggle();
            history.push(
              businessIdFromState || businessId
                ? `/order/business/${
                    encodedBusinessId || businessIdFromState || businessId
                  }`
                : "/"
            );
          }}
        >
          <Box {...styles.confirmation.wrapper}>
            Are you sure you want to close this order?
            <Text {...styles.confirmation.subtext}>
              All the details you entered will be lost
            </Text>
          </Box>
        </ConfirmationPopup>
      )}
      {loading && <Loader style={{position: "fixed"}} />}
      <Flex {...styles.main.container}>
        <Flex {...styles.main.wrapper}>
          <Flex {...styles.header.wrapper}>
            <Image src={ExitIcon} {...styles.header.image} onClick={toggle} />
            <Text {...styles.header.text}>{header}</Text>
          </Flex>
          {children}
          {error ? <Text variant="errorMessage">{error}</Text> : null}
          <Flex {...styles.footer.wrapper}>
            <Button
              variant="primary"
              {...styles.footer.button}
              disabled={disableBtn}
              onClick={onSubmit}
            >
              {submitText}
            </Button>
          </Flex>
          {showPoweredByCents ? (
            <Text {...styles.poweredByCents}>Powered by Cents</Text>
          ) : null}
        </Flex>
      </Flex>
    </>
  );
};

OrderScreenWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  businessId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  header: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disableBtn: PropTypes.bool,
  submitText: PropTypes.string,
  error: PropTypes.string,
  showPoweredByCents: PropTypes.bool,
};

OrderScreenWrapper.defaultProps = {
  loading: false,
  disableBtn: false,
  submitText: "NEXT",
  showPoweredByCents: false,
};

const styles = {
  main: {
    container: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    wrapper: {
      width: ["100%", "100%", "100%", "75%", "50%"],
      flexDirection: "column",
    },
  },
  header: {
    wrapper: {
      height: "67px",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      bg: "WHITE",
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
  footer: {
    wrapper: {
      p: "18px",
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      p: "18.5px",
      width: "100%",
    },
  },
  confirmation: {
    wrapper: {
      textAlign: "center",
      m: "0 24px",
    },
    subtext: {
      mt: "4px",
      fontSize: "13px",
      color: "TEXT_GREY",
      fontFamily: "secondary",
    },
  },
  poweredByCents: {
    textAlign: "center",
    color: "TEXT_GREY",
    lineHeight: "14px",
    fontSize: "12px",
    pb: "18.5px",
  },
};

export default OrderScreenWrapper;
