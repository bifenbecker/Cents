import React, {useEffect, useState} from "react";
import {createBrowserHistory} from "history";
import {useSelector} from "react-redux";
import LeftNav from "../left-navbar/LeftNavbar";
import RightNav from "../right-nav/right-nav";
import {useHistory, useRouteMatch} from "react-router-dom";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

function DoubleNav(props) {
  const {
    flags,
    setActiveTab,
    rightNav,
    tab,
    openRightNav,
    closeRightNav,
    rightTab,
    setRightTab,
    rightNavOpen,
  } = props;
  const doubleNavState = useSelector(
    (state) => state.businessOwner.globalSettings.doublenav
  );

  const [accountTabs, setAccountTabs] = useState([
    {title: "Details", url: "account", param: "details"},
    {title: "Payments", url: "account", param: "payments"},
    {title: "Regions", url: "account", param: "regions"},
    {title: "Taxes", url: "account", param: "taxes"},
    {title: "Settings", url: "account", param: "settings"},
  ]);

  useEffect(() => {
    if (flags.advancedCustomerPreferences) {
      let sideNavOptions = [...accountTabs];
      if (!sideNavOptions.find((navItem) => navItem.param === "preferences")) {
        sideNavOptions.push({title: "Preferences", url: "account", param: "preferences"});
        setAccountTabs(sideNavOptions);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags]);

  const productsAndServicesTabs = flags.cents20
    ? ["Laundry Services", "Dry Cleaning", "Products"]
    : ["Laundry Services", "Products"];

  const history = createBrowserHistory();
  const routeHistory = useHistory();
  const match = useRouteMatch();

  useEffect(
    () => {
      let filterParams = history.location;
      filterParams = filterParams.pathname.split("/");
      const currentTabInformation = getMappedTitle(
        filterParams[filterParams.length - 1],
        doubleNavState
      );
      if (currentTabInformation.length === 0) {
        return;
      } else {
        setActiveTab(currentTabInformation[0].title);
      }
      if (
        currentTabInformation[0].url === "products-services" ||
        currentTabInformation[0].url === "account"
      ) {
        rightNavOpen(true);
        openRightNav(true);
        setRightTab(currentTabInformation[0].param);
        currentTabInformation[0].url === "products-services"
          ? routeHistory.push(
              `${match.url}/${currentTabInformation[0].url}/${currentTabInformation[0].param}`
            )
          : routeHistory.push(
              `${match.url}/${currentTabInformation[0].url}/${currentTabInformation[0].param}`
            );
      } else {
        routeHistory.push(`${match.url}/${currentTabInformation[0].param}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      match.url,
      openRightNav,
      rightNav,
      rightNavOpen,
      routeHistory,
      routeHistory.location.pathname,
      setActiveTab,
      setRightTab,
      tab,
    ]
  );

  const getMappedTitle = (param, state) => {
    let possibleTabs = [
      {title: "Locations", url: "global-settings", param: "locations"},
      {title: "Devices", url: "global-settings", param: "devices"},
      {title: "Team", url: "global-settings", param: "teams"},
      {title: "Tasks", url: "global-settings", param: "task-manager"},
      {title: "Promotions", url: "global-settings", param: "promotions"},
      {title: "Account", rightNavTitle: "Details", url: "account", param: "details"},
      {
        title: "Account",
        rightNavTitle: "Payments",
        url: "account",
        param: "payments",
      },
      {title: "Account", rightNavTitle: "Regions", url: "account", param: "regions"},
      {title: "Account", rightNavTitle: "Taxes", url: "account", param: "taxes"},
      {
        title: "Account",
        rightNavTitle: "Settings",
        url: "account",
        param: "settings",
      },
      {
        title: "Account",
        rightNavTitle: "Preferences",
        url: "account",
        param: "preferences",
      },
      {
        title: "Products & Services",
        rightNavTitle: "Laundry Services",
        url: "products-services",
        param: "laundry-services",
      },
      {
        title: "Products & Services",
        rightNavTitle: "Dry Cleaning",
        url: "products-services",
        param: "dry-cleaning",
      },
      {
        title: "Products & Services",
        rightNavTitle: "Products",
        url: "products-services",
        param: "products",
      },
      {
        title: "Products & Services",
        rightNavTitle: "Pricing Tiers",
        url: "products-services",
        param: "tiers",
      },
      {
        title: "Products & Services",
        rightNavTitle: "Categories",
        url: "products-services",
        param: "categories",
      },
    ];
    possibleTabs = flags.cents20
      ? possibleTabs
      : possibleTabs.filter((tab) => {
          return tab.param !== "dry-cleaning" && tab.param !== "categories";
        });
    let tab = possibleTabs.filter((value) => value.param === param);
    if (tab.length === 0 && param === "products-services") {
      tab = [
        {
          title: "Products & Services",
          rightNavTitle: "Laundry Services",
          url: "products-services",
          param: "laundry-services",
        },
      ];
    }
    if (tab.length === 0 && param === "account") {
      tab = [
        {
          title: "Account",
          rightNavTitle: "Details",
          url: "account",
          param: "details",
        },
      ];
    }
    if (tab.length === 0 && param === "global-settings") {
      tab = possibleTabs.filter(
        (value) =>
          (value.param === state.rightTab && state.rightNav === true) ||
          (state.rightTab === "" && value.title === state.tab)
      );
    }
    return tab;
  };
  //On Page Load, grab any data for the other URL values, then pass into the rightNav component when left nav is clicked.
  return (
    <div className="double-nav-container">
      <div className="left-container">
        <LeftNav
          tab={tab}
          onSetActiveTab={setActiveTab}
          onRightNavOpen={rightNavOpen}
          onSetRightTab={setRightTab}
          onOpenRightNav={openRightNav}
          onCloseRightNav={closeRightNav}
        />
      </div>
      <div className={rightNav ? "right-container" : "right-container-inactive"}>
        {rightNav ? (
          <RightNav
            title={tab}
            data={tab === "Account" ? accountTabs : productsAndServicesTabs}
            rightTab={rightTab}
            setRightTab={setRightTab}
          />
        ) : null}
      </div>
    </div>
  );
}

export default withLDConsumer()(DoubleNav);
