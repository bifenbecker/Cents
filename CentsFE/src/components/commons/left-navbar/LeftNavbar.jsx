import React from "react";
import {Link, useRouteMatch} from "react-router-dom";
import cx from "classnames";
import PropTypes from "prop-types";
import {useFlags} from "launchdarkly-react-client-sdk";

import {TABS, ACCOUNT_TAB} from "./constants";
import {ReactComponent as HelpIcon} from "../../../assets/images/Help.svg";
import {HELP_BUTTON_ID} from "../../../constants/index.js";

function LeftNavbar({
  tab,
  onSetActiveTab,
  onOpenRightNav,
  onCloseRightNav,
  onSetRightTab,
  onRightNavOpen,
}) {
  const match = useRouteMatch();
  const {intercomDevelopment} = useFlags();
  const handleClick = (tabTitle) => {
    try {
      onSetActiveTab(tabTitle);

      if ([TABS.PRODUCTS_AND_SERVICES.title, ACCOUNT_TAB.title].includes(tabTitle)) {
        const rightTab =
          tabTitle === TABS.PRODUCTS_AND_SERVICES.title ? "laundryservices" : "details";

        onSetRightTab(rightTab);
        onOpenRightNav(true);
        onRightNavOpen(true);
      } else {
        onSetRightTab("");
        onCloseRightNav(false);
        onRightNavOpen(false);
      }
    } catch (err) {
      console.log("the err: ", err);
    }
  };
  const isAccountTabSelected = tab === ACCOUNT_TAB.title;

  return (
    <div className="left-navbar-container">
      <div className="items-container">
        <div className="upper-items-container">
          {Object.values(TABS).map(({title, url, icon, selectedIcon}) => {
            const isCurrentTab = tab === title;

            return (
              <Link key={title} className="link-container" to={`${match.url}/${url}`}>
                <div className="item-container" onClick={() => handleClick(title)}>
                  {isCurrentTab ? selectedIcon : icon}
                  <p
                    className={cx({"title-selected": isCurrentTab, title: !isCurrentTab})}
                  >
                    {title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="bottom-menu-container">
          <Link to={`${match.url}/${ACCOUNT_TAB.url}`}>
            <div
              className="lower-items-container item-container"
              onClick={() => handleClick(ACCOUNT_TAB.icon)}
            >
              {isAccountTabSelected ? ACCOUNT_TAB.selectedIcon : ACCOUNT_TAB.icon}
              <p
                className={cx({
                  "title-selected": isAccountTabSelected,
                  title: !isAccountTabSelected,
                })}
              >
                {ACCOUNT_TAB.title}
              </p>
            </div>
          </Link>
          {intercomDevelopment && (
            <Link id={HELP_BUTTON_ID}>
              <div className="lower-items-container item-container">
                <HelpIcon />
                <p className="help-title">Help</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

LeftNavbar.propTypes = {
  tab: PropTypes.string,
  onSetActiveTab: PropTypes.func,
  onOpenRightNav: PropTypes.func,
  onCloseRightNav: PropTypes.func,
  onSetRightTab: PropTypes.func,
  onRightNavOpen: PropTypes.func,
};

export default LeftNavbar;
