const styles = {
  mainWrapper: {
    sx: {
      height: "100%",
      flexDirection: "column",
    },
    p: "20px",
    pt: 0,
  },

  header: {
    wrapper: {
      height: "67px",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "18px",
      sx: {
        position: "relative",
      },
    },
    text: {
      fontSize: "18px",
    },
  },
  popoverItem: {
    p: "16px 10px",
    width: "100%",
    sx: {border: "none", cursor: "pointer"},
    fontFamily: "secondary",
    fontSize: `clamp(14px, 5vw, 16px)`,
  },

  locationText: {
    color: "BLACK",
    fontSize: "18px",
    margin: "18px 0px 10px",
  },

  bodyWrapper: {
    flexDirection: "column",
  },

  weekDetails: {
    margin: "20px 0px 10px",
  },

  detailWrapper: {
    flexDirection: "column",
    margin: "20px 0px",
  },
  deliveryDetails: {
    flexDirection: "column",
    margin: "15px 0px",
  },
  normalText: {
    fontSize: "14px",
    color: "BLACK",
    fontFamily: "secondary",
    lineHeight: "22px",
  },
  blueText: {
    color: "CENTS_BLUE",
    sx: {textDecoration: "underline", cursor: "pointer"},
  },
  redText: {
    color: "TEXT_RED",
    pl: "4px",
  },
  childrenStyles: {
    sx: {
      bg: "#F5F9FE",
    },
  },

  footerWrapper: {
    sx: {
      alignItems: "flex-end",
      justifyContent: "center",
      width: "100%",
      height: "100%",
    },
  },
  saveButton: {
    sx: {
      backgroundColor: "primary",
      width: "100%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    p: "18px",
  },
  footerDescription: {
    fontSize: "14px",
    color: "TEXT_GREY",
    fontFamily: "secondary",
    lineHeight: "16px",
  },
};

export default styles;
