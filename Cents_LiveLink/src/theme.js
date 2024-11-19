// theme.js
import merge from "lodash.merge";
import preset from "@rebass/preset";

import {fonts, timelineCircleDimensions} from "./utils/theme";

export default merge(preset, {
  breakpoints: ["375px", "400px", "550px", "950px", "1200px", "1440px", "1800px"],
  colors: {
    CENTS_BLUE: "#3D98FF",
    primary: "#3D98FF",
    BACKGROUND_LIGHT_BLUE: "#E9F1FB",
    WHITE: "#FFFFFF",
    secondary: "#FFFFFF",
    BLACK: "#000000",
    TEXT_RED: "#B00020",
    BACKGROUND_RED: "#F3DAD9",
    HEADER_GREEN: "#01816D",
    BACKGROUND_LIGHT_GREY: "#F3F3F3",
    TEXT_LIGHT_GREY: "#505050",
    BACKGROUND_GREY: "#DFDFDF",
    TEXT_GREY: "#7B7B7B",
    DISABLED_TEXT_GREY: "#AAB1BF",
    LABEL_GREY: "#A5ADBB",
    MASK_GREY: "rgba(250,250,250,0.9)",
    INPUT_BORDER_COLOR: "rgba(0,0,0,0.32)",
    SEPERATOR_GREY: "#BBBBBB",
    SUCCESS_TEXT_GREEN: "#3EA900",
    TRANSLUCENT_BACKGROUND: "rgba(250,250,250,0.93)",
    ERROR_TEXT: "#FF0000",
    HAMBURGER_MENU_BACKGROUND: "#F5F9FE",
    HAMBURGER_MENU_SEPERATOR: "#C3C3C3",
    ERROR_RED: "#B0001F",
    HUB_NOTIFICATION_GREY: "#EAF4FF",
    STICKY_HEADER_BACKGROUND: "rgba(250,250,250,1)",
    BOX_BORDER: "#E1E4E5",
    LIGHT_GREY_TEXT: "#B1B1B1",
  },
  fonts: {
    ...fonts,
    body: fonts["Roboto Bold"],
    heading: fonts["Roboto Bold"],
    primary: fonts["Roboto Bold"],
    secondary: fonts["Roboto Regular"],
  },
  text: {
    errorMessage: {
      textAlign: "center",
      fontSize: "14px",
      color: "ERROR_RED",
      my: "20px",
      width: "100%",
    },
    footerTimeWindow: {
      fontSize: "16px",
      fontWeight: "normal",
      fontFamily: "secondary",
    },
    inStorePickupHeader: {
      fontSize: "24px",
      mt: "25px",
    },
    inStorePickupText: {
      fontSize: "18px",
      mt: "15px",
      mb: "30px",
    },
    blackText: {
      fontSize: [1, 2],
      color: "BLACK",
    },
    link: {
      fontSize: [1, 2],
      color: "primary",
      textDecoration: "underline",
      cursor: "pointer",
    },
    blackLink: {
      fontSize: [1, 2],
      color: "BLACK",
      textDecoration: "underline",
      cursor: "pointer",
    },
  },
  variants: {
    blackText: {
      fontSize: [1, 2],
      color: "BLACK",
    },
    timelineCurrentCircle: {
      ...timelineCircleDimensions.large,
      border: "3px solid",
      borderColor: "CENTS_BLUE",
      borderRadius: "100vh",
    },
    timelineFutureCircle: {
      ...timelineCircleDimensions.small,
      border: "2px solid",
      borderColor: "#D5D5D5",
      borderRadius: "100vh",
    },
    deliveryTimelineCurrentCircle: {
      ...timelineCircleDimensions.large,
      bg: "transparent",
      border: "2px solid",
      borderColor: "CENTS_BLUE",
      borderRadius: "100vh",
    },
    deliveryTimelineFutureCircle: {
      ...timelineCircleDimensions.small,
      border: "2px solid",
      borderColor: "BACKGROUND_GREY",
      borderRadius: "100vh",
    },
  },
  buttons: {
    primary: {
      ...preset.buttons.primary,
      bg: "primary",
      color: "secondary",
      fontFamily: "primary",
      fontWeight: "normal",
      outline: "none",
      cursor: "pointer",
      borderRadius: "31px",
      "&:disabled": {
        bg: "BACKGROUND_GREY",
        pointerEvents: "none",
      },
    },
    outline: {
      ...preset.buttons.outline,
      variant: "buttons.primary",
      bg: "WHITE",
      color: "primary",
      border: "1px solid",
      borderColor: "primary",
      fontFamily: "secondary",
      boxShadow: "none",
    },
    thickOutline: {
      variant: "buttons.outline",
      borderWidth: "3px",
      fontFamily: "primary",
    },
  },
  forms: {
    input: {
      fontFamily: "secondary",
    },
    textarea: {
      fontFamily: "secondary",
    },
  },
  shadows: [],
});
