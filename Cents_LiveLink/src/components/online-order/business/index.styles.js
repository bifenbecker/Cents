import {BackgroundImage} from "../../../assets/images/index";
import {makeStyles} from "@material-ui/styles";

export const styles = {
  main: {
    container: {
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: "WHITE",
      height: "calc(100vh - 282px - 67px)",
    },
    wrapper: {
      width: ["100%", "100%", "100%", "60%", "50%", "33%"],
      flexDirection: "column",
    },
  },
  contentWrapper: {
    flexDirection: "column",
    flex: 1,
  },
  backgroundWrapper: {
    flexDirection: "column",
    sx: {
      background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFBFB 100%), url(${BackgroundImage})`,
      backgroundSize: "cover",
    },
    height: "282px",
  },
  textContent: {
    mt: "80px",
    flexDirection: "column",
    textAlign: "center",
    text: {
      fontSize: "30px",
      letterSpacing: "0",
      lineHeight: "30px",
      mb: "10px",
    },
    tagline: {
      fontSize: "14px",
    },
  },
  bottomTextContainer: {
    mx: "auto",
    mt: "auto",
    pb: "12.5px",
    text: {
      textAlign: "left",
      fontSize: "18px",
      lineHeight: "21px",
    },
  },
  textboxWrapper: {
    width: "100%",
    px: "20px",
    pt: "20px",
    pb: "10px",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  pickupPillsWrapper: {
    mx: "20px",
    flexDirection: "column",
    mb: "20px",
  },
  typographyFont: {
    padding: "16px",
    fontFamily: "Inter",
    fontStyle: "normal",
    fontSize: "24px",
    fontWeight: "700",
    lineHeight: "29px",
  },
};

export const useStyles = makeStyles((theme) => {
  return {
    main: {
      container: {
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "WHITE",
        height: "calc(100vh - 282px - 67px)",
      },
      wrapper: {
        width: ["100%", "100%", "100%", "60%", "50%", "33%"],
        flexDirection: "column",
      },
    },
    gridWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    grid: {
      maxWidth: "504px",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    contentWrapper: {
      flexDirection: "column",
      flex: 1,
    },
    backgroundWrapper: {
      flexDirection: "column",
      sx: {
        background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFBFB 100%), url(${BackgroundImage})`,
        backgroundSize: "cover",
      },
      height: "282px",
    },
    textContent: {
      mt: "80px",
      flexDirection: "column",
      textAlign: "center",
      text: {
        fontSize: "30px",
        letterSpacing: "0",
        lineHeight: "30px",
        mb: "10px",
      },
      tagline: {
        fontSize: "14px",
      },
    },
    bottomTextContainer: {
      mx: "auto",
      mt: "auto",
      pb: "12.5px",
      text: {
        textAlign: "left",
        fontSize: "18px",
        lineHeight: "21px",
      },
    },
    textboxWrapper: {
      width: "100%",
      px: "20px",
      pt: "20px",
      pb: "10px",
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center",
    },
    pickupPillsWrapper: {
      mx: "20px",
      flexDirection: "column",
      mb: "20px",
    },
    typographyFont: {
      padding: "16px",
      fontFamily: "Inter",
      fontStyle: "normal",
      fontSize: "24px",
      fontWeight: "700",
      lineHeight: "29px",
    },
    homePageTitle: {
      fontFamily: "Inter !important",
      fontStyle: "normal !important",
      fontSize: "24px !important",
      fontWeight: "700 !important",
      lineHeight: "29px !important",
      color: "#303651",
    },
    homePageTitleWrapper: {
      padding: 0,
      marginBottom: 16,
    },
    manageAddressesGrid: {
      "@media (max-width: 375px)": {
        minWidth: 320,
      },
      "@media (min-width: 375px)": {
        width: 375,
      },
    },
    imageCardGrid: {
      width: "calc(100% - 20px)",
      "@media (max-width: 500px)": {
        marginTop: 20,
      },
      "@media (min-width: 500px)": {
        marginTop: 32,
      },
    },

    homePageButtonGrid: {
      "@media (max-width: 500px)": {
        width: "100%",
      },
      "@media (min-width: 500px)": {
        width: "calc(100% - 20px)",
      },
    },

    homePageButtonWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "@media (max-width: 500px)": {
        height: 111,
        position: "fixed",
        bottom: 0,
        width: "100%",
        zIndex: 9,
      },
    },

    homePageButtonOverlappingWrapper: {
      backgroundColor: "white",
      borderRadius: "6px 6px 0 0",
      boxShadow:
        "0px 2px 4px rgba(0, 0, 0, 0.14), 0px 3px 2px -2px rgba(0, 0, 0, 0.12), 0px 1px 7px rgba(0, 0, 0, 0.2)",
    },
  };
});
