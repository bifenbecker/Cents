import React, {useMemo} from "react";
import {Box, Flex, Image, Link, Text} from "rebass/styled-components";
import {useHistory} from "react-router-dom";
import Dock from "react-dock";
import PropTypes from "prop-types";

import {greyLogo} from "../../assets/images";
import {logoutCustomer} from "../../utils/common";
import useCustomerState from "../../hooks/useCustomerState";

const routes = [
  // {name: "My Orders", path: "#", disabled: true},
  // {name: "My Account", path: "#", disabled: true},
  // {name: "Promos & Credits", path: "#", disabled: true},
  // {name: "Contact Us", path: "#", disabled: true},
  {
    name: "My Recurring Orders",
    key: "subscriptions",
    path: "/subscriptions",
    disabled: false,
  },
];

const Sidebar = props => {
  const {sidebarOpen, setSidebarOpen, termsOfServiceUrl} = props;
  const history = useHistory();
  const {customer} = useCustomerState();

  const getTosUrl = useMemo(() => {
    return termsOfServiceUrl || "https://www.trycents.com/template/wdf-tos";
  }, [termsOfServiceUrl]);

  const footerRoutes = [
    {name: "Privacy Policy", href: "https://www.trycents.com/privacy-policy"},
    {name: "Terms Of Use", href: getTosUrl},
  ];

  return (
    <Dock
      fluid={false}
      size={280}
      isVisible={sidebarOpen}
      dimStyle={styles.dimStyle}
      dockStyle={styles.dockStyle}
      onVisibleChange={() => setSidebarOpen(!sidebarOpen)}
    >
      <Flex {...styles.contentWrapper}>
        <Text {...styles.customerName}>Hi {customer.firstName}!</Text>
        {routes.map(route => (
          <Text
            {...styles.route}
            key={route.key || route.name}
            onClick={() => history.push(route.path)}
            color={route.disabled ? "DISABLED_TEXT_GREY" : styles.route.color}
          >
            {route.name}
          </Text>
        ))}
        <Text
          {...styles.route}
          key="logout"
          onClick={() => {
            logoutCustomer();
            history.push("/verify-account");
          }}
        >
          Logout
        </Text>
        <Box {...styles.separator} />
        {footerRoutes.map(route => (
          <Link
            {...styles.route}
            {...styles.footerRoutes}
            key={route.name}
            href={route.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {route.name}
          </Link>
        ))}
        <Flex {...styles.poweredByCents}>
          <Text mr="2">powered by</Text>
          <Image src={greyLogo} />
        </Flex>
      </Flex>
    </Dock>
  );
};

const styles = {
  dockStyle: {
    marginTop: "67px",
  },
  dimStyle: {
    background: "none",
  },
  contentWrapper: {
    flexDirection: "column",
    height: "calc(var(--app-height) - 67px)",
  },
  customerName: {
    bg: "BACKGROUND_LIGHT_GREY",
    pl: "1.2rem",
    py: ["24px", "36px"],
    fontSize: ["1.2rem", "1.5rem"],
  },
  separator: {
    marginTop: "auto",
    height: "2px",
    width: "50px!important",
    bg: "black",
    mx: "1.2rem",
    mb: [3, 4],
  },
  route: {
    fontFamily: "primary",
    color: "TEXT_LIGHT_GREY",
    px: "1.2rem",
    py: ["0.75rem", "1rem", "1.2rem"],
    fontSize: ["1rem", "1.125rem"],
    sx: {
      cursor: "pointer",
    },
  },
  footerRoutes: {
    sx: {
      fontSize: ["0.75rem!important", "0.8125rem!important"],
      textTransform: "uppercase",
      textDecoration: "none",
    },
  },
  poweredByCents: {
    fontFamily: "Roboto Bold",
    textAlign: "center",
    py: ["0.75rem", "1rem", "1.5rem"],
    fontSize: "14px",
    color: "TEXT_GREY",
    justifyContent: "center",
    alignItems: "flex-end",
  },
};

Sidebar.propTypes = {
  setSidebarOpen: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool,
};

Sidebar.defaultProps = {
  sidebarOpen: false,
};

export default Sidebar;
