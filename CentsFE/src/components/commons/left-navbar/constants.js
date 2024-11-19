import React from "react";
import {ReactComponent as LocationsIconDefault} from "../../../assets/images/Icon_Locations_Default.svg";
import {ReactComponent as LocationsIconSelected} from "../../../assets/images/Icon_Locations_Selected.svg";
import {ReactComponent as TeamIconDefault} from "../../../assets/images/Icon_Team_Default.svg";
import {ReactComponent as TeamIconSelected} from "../../../assets/images/Icon_Team_Selected.svg";
import {ReactComponent as ProductServicesIconDefault} from "../../../assets/images/Icon_Products_Services_Default.svg";
import {ReactComponent as ProductServicesIconSelected} from "../../../assets/images/Icon_Products_Services_Selected.svg";
import {ReactComponent as TasksIconDefault} from "../../../assets/images/Icon_Tasks_Default.svg";
import {ReactComponent as TasksIconSelected} from "../../../assets/images/Icon_Tasks_Selected.svg";
import {ReactComponent as DevicesIconDefault} from "../../../assets/images/Icon_Devices_Default.svg";
import {ReactComponent as DevicesIconSelected} from "../../../assets/images/Icon_Devices_Selected.svg";
import {ReactComponent as PromotionsIconDefault} from "../../../assets/images/Icon_Promotions_Default.svg";
import {ReactComponent as PromotionIconSelected} from "../../../assets/images/Icon_Promotions_Selected.svg";
import {ReactComponent as AccountIconDefault} from "../../../assets/images/Icon_Acccount_Default.svg";
import {ReactComponent as AccountIconSelected} from "../../../assets/images/Icon_Account_Selected.svg";

export const TABS = {
  LOCATIONS: {
    title: "Locations",
    url: "locations",
    icon: <LocationsIconDefault />,
    selectedIcon: <LocationsIconSelected />,
  },
  TEAM: {
    title: "Team",
    url: "teams",
    icon: <TeamIconDefault />,
    selectedIcon: <TeamIconSelected />,
  },
  PRODUCTS_AND_SERVICES: {
    title: "Products & Services",
    url: "products-services",
    icon: <ProductServicesIconDefault />,
    selectedIcon: <ProductServicesIconSelected />,
  },
  TASKS: {
    title: "Tasks",
    url: "task-manager",
    icon: <TasksIconDefault />,
    selectedIcon: <TasksIconSelected />,
  },
  DEVICES: {
    title: "Devices",
    url: "devices",
    icon: <DevicesIconDefault />,
    selectedIcon: <DevicesIconSelected />,
  },
  PROMOTIONS: {
    title: "Promotions",
    url: "promotions",
    icon: <PromotionsIconDefault />,
    selectedIcon: <PromotionIconSelected />,
  },
};

export const ACCOUNT_TAB = {
  title: "Account",
  url: "account",
  icon: <AccountIconDefault />,
  selectedIcon: <AccountIconSelected />,
};
