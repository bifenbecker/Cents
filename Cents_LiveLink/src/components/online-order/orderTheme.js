import {defaultFallbackFonts} from "utils/theme";

export const defaultFontFamily = `Inter, ${defaultFallbackFonts}`;

export const orderThemeColors = {
  textMain: "#303651",
  blackText: "#000000",
  grayText: "#7B7B7B",
};

export const typography = {
  typography: {
    fontSize: 12,
    fontFamily: defaultFontFamily,
    h1: {
      fontSize: 18,
      fontWeight: 600,
      color: orderThemeColors.textMain,
    },
    h2: {
      fontSize: 16,
      fontWeight: 600,
      color: orderThemeColors.textMain,
    },
    h3: {
      fontSize: 14,
      fontWeight: 600,
      color: orderThemeColors.textMain,
    },
    h4: {
      fontSize: 12,
      fontWeight: 600,
      color: orderThemeColors.textMain,
    },
    h5: {
      fontSize: 12,
      fontWeight: 600,
      color: orderThemeColors.grayText,
    },
    h6: {
      fontSize: 18,
      fontWeight: 500,
      color: orderThemeColors.textMain,
    },

    subtitle1: {
      fontSize: 16,
      fontWeight: 500,
      color: orderThemeColors.textMain,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: 500,
      color: orderThemeColors.blackText,
    },
  },
};
