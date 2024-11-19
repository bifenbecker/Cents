import {fonts} from "../../../../utils/theme";

const screenWidth = window.screen.width;

const styles = {
  cardWrapper: {
    width: "calc(100% - 36px)",
    height: "275px",
    margin: "12px 18px 12px 18px",
    sx: {
      borderRadius: "24px",
      boxShadow: "0 1px 6px rgba(0, 0, 0, .2)",
    },
  },
  headerWrapper: {
    width: "100%",
    height: "88px",
    bg: "#E9F1FB",
    px: "30px",
    justifyContent: "space-between",
    alignItems: "center",
    sx: {
      borderTopRightRadius: "24px",
      borderTopLeftRadius: "24px",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.18)",
    },
  },
  threeDotMenu: {
    width: "28px",
  },
  addressText: {
    fontWeight: "700",
    fontSize: "18px",
    lineHeight: "24px",
  },
  contentWrapper: {
    width: "100%",
    height: "calc(100% - 128px)",
    p: "30px 15px 30px 30px",
  },
  bluetext: {
    color: "#3790F4",
    fontWeight: "700",
    fontSize: "16px",
    lineHeight: "16px",
  },
  contentContainer: {
    mt: "24px",
  },
  textContainer: {
    pb: "8px",
  },
  headerText: {
    fontWeight: "700",
    fontSize: screenWidth > 320 ? "14px" : "12px",
    fontFamily: fonts["Roboto Bold"],
    marginRight: "5px",
  },
  text: {
    pl: "2px",
    fontSize: screenWidth > 320 ? "14px" : "12px",
    fontWeight: "400",
    fontFamily: fonts["Roboto Regular"],
  },
  footerWrapper: {
    width: "100%",
    height: "40px",
    alignItems: "center",
    pl: "24px",
    sx: {
      borderBottomRightRadius: "24px",
      borderBottomLeftRadius: "24px",
      borderTop: "1px solid #C4C4C4",
    },
  },
  normaltext: {
    fontSize: screenWidth > 320 ? "12px" : "10px",
    pl: "6px",
  },
  redText: {
    color: "#B00020",
  },
  childrenStyles: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    sx: {
      bottom: "-80px",
      bg: "secondary",
      width: "250px",
      height: "65px",
      right: "-29px",
    },
  },
  popoverItem: {
    p: "16px",
    width: "100%",
    sx: {border: "none", cursor: "pointer"},
    fontFamily: fonts["Roboto Regular"],
  },
  uppercase: {
    sx: {textTransform: "uppercase"},
  },
};

export default styles;
