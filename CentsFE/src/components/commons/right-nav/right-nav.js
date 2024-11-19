import React from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import {useFlags} from "launchdarkly-react-client-sdk";

function RightNav(props) {
  const {title, data, setRightTab, rightTab} = props;
  const history = useHistory();
  const match = useRouteMatch();
  const flags = useFlags();
  const subHeaders = flags.cents20
    ? [
        {title: "Pricing Tiers", route: "tiers"},
        {title: "Categories", route: "categories"},
      ]
    : [{title: "Pricing Tiers", route: "tiers"}];

  const handleRouting = (tab) => {
    if (title === "Account") {
      history.push(`${match.url}/account/${tab}`);
    }
    if (title === "Products & Services") {
      history.push(`${match.url}/products-services/${tab}`);
    }
    setRightTab(tab);
  };
  return (
    <div className="right-nav-container">
      <div className="content-container">
        <div className="title-container">
          <p className="title">{title}</p>
        </div>
        <div className="headers-wrapper">
          {title === "Account"
            ? data.map((item, index) => {
                return (
                  <div
                    className={
                      rightTab === item.param
                        ? "selected-item-container"
                        : "item-container"
                    }
                    key={`${item.title}_${index}`}
                    onClick={() => handleRouting(item.param)}
                  >
                    <p
                      className={
                        rightTab === item.param ? "selected-subtitle" : "subtitle"
                      }
                    >
                      {item.title}
                    </p>
                  </div>
                );
              })
            : data.map((item, index) => {
                const tab = item.toLowerCase().replace(/\s+/g, "-");
                return (
                  <div
                    key={`${item}_${index}`}
                    className={
                      rightTab === tab ? "selected-item-container" : "item-container"
                    }
                    onClick={() => handleRouting(tab)}
                  >
                    <p className={rightTab === tab ? "selected-subtitle" : "subtitle"}>
                      {item}
                    </p>
                  </div>
                );
              })}
        </div>
        <hr className="placeholder" />
        {title === "Account" ? null : (
          <div className="subheader-container">
            {subHeaders.map((header, index) => {
              const tab = header.route.toLowerCase().replace(/\s+/g, "");
              return (
                <div
                  key={`${header.title}_${index}`}
                  className={
                    rightTab === tab ? "selected-item-container" : "item-container"
                  }
                  onClick={() => handleRouting(header.route)}
                >
                  <p className={rightTab === tab ? "selected-subtitle" : "subtitle"}>
                    {header.title}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RightNav;
