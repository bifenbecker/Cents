import React, {memo} from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import PropTypes from "prop-types";

import {logo, MobileMenu} from "../../assets/images";

import {
  COMPLETED_OR_CANCELED_ORDER_STATUSES,
  ORDER_DELIVERY_UPDATABLE_STATUSES,
  ORDER_TYPES,
} from "../../constants/order";
import useCustomerState from "../../hooks/useCustomerState";

const Header = (props) => {
  const {onMenuClick, logoUrl, onManageOrderClick, order, isLogoNeeded} = props;

  const {customerAuthToken: isLoggedIn} = useCustomerState();

  const canSaveReturnDelivery =
    !order?.delivery?.status ||
    ORDER_DELIVERY_UPDATABLE_STATUSES.includes(order?.delivery?.status);

  const canManage =
    Object.keys(order || {})?.length &&
    (order.orderType === ORDER_TYPES.residential ||
      (canSaveReturnDelivery &&
        !COMPLETED_OR_CANCELED_ORDER_STATUSES.includes(order?.status)));

  return (
    <Flex as="header" {...styles.wrapper}>
      {isLoggedIn && (
        <Box {...styles.menu}>
          <Image height="19px" src={MobileMenu} onClick={onMenuClick} />
        </Box>
      )}
      {isLogoNeeded && (
        <Flex {...styles.logoWrapper}>
          <Image height="30px" src={logoUrl || logo} />
        </Flex>
      )}

      <Box {...styles.rightContainer}>
        {canManage ? (
          <Text {...styles.deliveryLink} onClick={onManageOrderClick}>
            Manage
          </Text>
        ) : null}
      </Box>
    </Flex>
  );
};

const styles = {
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: "67px",
    bg: "WHITE",
    sx: {
      position: "sticky",
      top: 0,
      boxShadow: "0 0 3px rgba(0, 0, 0, .25)",
      zIndex: 9,
    },
  },
  menu: {
    sx: {
      position: "absolute",
      left: 3,
    },
  },
  rightContainer: {
    sx: {
      position: "absolute",
      right: 3,
    },
  },
  logo: {
    sx: {
      top: -1,
      left: -1,
      position: "relative",
    },
  },
  logoWrapper: {
    flexDirection: "row",
  },
  deliveryButton: {
    sx: {
      // marginLeft: 10,
      backgroundColor: "#3790F4",
      borderRadius: 23.48,
      width: [120, 170],
      height: [40, 47],
      fontWeight: 400,
      fontSize: [12, 14],
      fontFamily: "inherit",
    },
  },
  deliveryLink: {
    sx: {
      color: "#3790F4",
      textDecoration: "underline",
      fontSize: "14px",
      cursor: "pointer",
    },
  },
};

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
  logoUrl: PropTypes.string,
  isLogoNeeded: PropTypes.bool,
};

Header.defaultProps = {
  isLogoNeeded: false,
  logoUrl: "",
};

export default memo(Header);
