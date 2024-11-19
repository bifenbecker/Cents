import {hexToRgba} from "./styles";

export const defaultFallbackFonts =
  "Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,sans-serif";

export const fonts = {
  "Verlag Black": `Verlag Black, Roboto Bold, ${defaultFallbackFonts}`,
  "Verlag Book": `Verlag Book, Roboto Regular, ${defaultFallbackFonts}`,
  "Roboto Regular": `Roboto Regular, ${defaultFallbackFonts}`,
  Inter: `Inter, ${defaultFallbackFonts}`,
};

export const getStoreTheme = (theme, storeSettings) => {
  const {theme: themeSettings} = storeSettings || {theme: {}};

  return applyTheme(theme, themeSettings);
};

export const applyTheme = (theme, themeSettings) => {
  const {primaryColor, secondaryColor, boldFont, normalFont, borderRadius} =
    themeSettings || {};

  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: primaryColor || theme.colors.primary,
      secondary: secondaryColor || theme.colors.secondary,
      transparentPrimary: hexToRgba(primaryColor || theme.colors.primary, 0.2),
    },
    palette: {
      primary: {
        main: primaryColor || theme.colors.primary,
        contrastText: "#FFFFFF",
      },
    },
    fonts: {
      ...theme.fonts,
      body: fonts[boldFont] || theme.fonts.primary,
      heading: fonts[boldFont] || theme.fonts.primary,
      primary: fonts[boldFont] || theme.fonts.primary,
      secondary: fonts[normalFont] || theme.fonts.secondary,
    },
    buttons: {
      ...theme.buttons,
      primary: {
        ...theme.buttons.primary,
        borderRadius: borderRadius || theme.buttons.primary.borderRadius,
      },
    },
    overrides: {
      MuiButton: {
        root: {
          borderRadius: borderRadius || theme.buttons.primary.borderRadius,
        },
      },
    },
  };
};

export const timelineCircleDimensions = {
  large: {
    height: "47.54px",
    width: "47.54px",
  },
  small: {
    height: "28.7px",
    width: "28.7px",
  },
};

export const getFilterClass = (color) => {
  switch (color) {
    case "#3790f4":
      return "filter-1";
    case "#cc630d":
      return "filter-2";
    case "#181818":
      return "filter-3";
    case "#3a7f2e":
      return "filter-4";
    case "#384fb2":
      return "filter-5";
    case "#291069":
      return "filter-6";
    case "#b30000":
      return "filter-7";
    case "#6a016e":
      return "filter-8";
    case "#016060":
      return "filter-9";
    case "#6626a7":
      return "filter-10";
    case "#ad0045":
      return "filter-11";
    case "#0a244a":
      return "filter-12";

    default:
      return "filter-1";
  }
};
