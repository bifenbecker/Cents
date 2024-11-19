import React from "react";
import PropTypes from "prop-types";

const TabSwitcher = ({tabs, onTabClick, activeTab, className, disabled}) => {
  const getTabClass = (tab) => {
    if (activeTab === tab.value) {return "active";}
    if (disabled) {return "disabled";}
    return "";
  };

  const renderTabs = () => {
    return tabs.map((tab) => {
      return (
        <div
          className={`tab ${getTabClass(tab)}`}
          key={`tab-item-${tab.value}`}
          onClick={() => {
            onTabClick && onTabClick(tab.value);
          }}
        >
          <p>{tab.label}</p>
        </div>
      );
    });
  };

  return <div className={`tab-switcher ${className && className}`}>{renderTabs()}</div>;
};

TabSwitcher.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onTabClick: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
};

export default TabSwitcher;
