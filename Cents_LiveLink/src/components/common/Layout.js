import React from "react";
import PropTypes from "prop-types";

import useToggle from "../../hooks/useToggle";

import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = (props) => {
  const {
    children,
    logoUrl,
    onManageOrderClick,
    orderDetails,
    businessSettings,
    isLogoNeeded,
  } = props;

  const {
    isOpen: sidebarOpen,
    setIsOpen: setSidebarOpen,
    toggle: toggleSidebar,
  } = useToggle();

  return (
    <>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        termsOfServiceUrl={
          businessSettings?.isCustomUrl && businessSettings?.termsOfServiceUrl
        }
      />
      <Header
        onMenuClick={toggleSidebar}
        isLogoNeeded={isLogoNeeded}
        logoUrl={logoUrl}
        onManageOrderClick={onManageOrderClick}
        order={orderDetails}
      />
      {children}
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  logoUrl: PropTypes.string,
  isLogoNeeded: PropTypes.bool,
};

Layout.defaultProps = {
  isLogoNeeded: true,
  logoUrl: "",
};

export default Layout;
