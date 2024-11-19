import {HELP_BUTTON_ID} from "../constants";

export const formattedUserId = (id) => {
  const userId = id.toString();
  let length = 6 - userId.length;

  return `${"0".repeat(length)}${userId}`;
};

export const formatToThousandRoundedNumber = (value) => {
  let number = Number(value);
  if (!number) {
    return 0;
  }

  return `${number.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
};

/**
 * @param {String} template - The template to parse, should use {{placeholder}} to replace with data values
 * @param {Object} data - The data to use in the template (placeholder as key/value)
 * @returns {String} - The parsed string
 */
export const parseTemplate = (template, data = {}) => {
  return template && data && typeof data === "object"
    ? template.replace(/\{\{(.*?)\}\}/gi, (match, key) => data[key] || "")
    : "Description was not specified or data has invalid format";
};

// React UTILS

export function isClassComponent(component) {
  return typeof component === "function" && !!component?.prototype?.isReactComponent
    ? true
    : false;
}

export function isFunctionComponent(component) {
  return typeof component === "function" &&
    String(component).includes("return React.createElement")
    ? true
    : false;
}

export function isReactComponent(component) {
  return isClassComponent(component) || isFunctionComponent(component) ? true : false;
}

export const setStringifiedLocalStorageData = (itemName, item) => {
  try {
    localStorage.setItem(itemName, JSON.stringify(item));
  } catch (error) {
    console.log(error);
  }
};

export const getParsedLocalStorageData = (itemName) => {
  try {
    return JSON.parse(localStorage.getItem(itemName)) || {};
  } catch (error) {
    return {};
  }
};

/**
 * Get Intercom boot data for user
 *
 * @param {string} email
 * @param {string} uuid
 * @param {string} firstName
 * @param {string} lastName
 * @returns {Object} Intercom data
 */
export const getIntercomBootData = (email, uuid, firstName, lastName) => {
  return {
    email,
    userId: uuid,
    name: `${firstName} ${lastName}`,
    hideDefaultLauncher: true, // always launch Intercom messenger by clicking on Help button so default launcher is always hidden
    alignment: "left", // always keep messenger to the left
    verticalPadding: 20, // min value
    horizontalPadding: 20, // min value
    customLauncherSelector: `#${HELP_BUTTON_ID}`,
  };
};
