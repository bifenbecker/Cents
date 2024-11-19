const orderSectionStyles = {
  header: {
    p: "20px 18px",
    bg: "rgb(234, 241, 250)",
    fontSize: "14px",
  },
  link: {
    wrapper: {
      p: "24px 0",
      m: "0 18px",
      alignItems: "center",
      sx: {
        borderBottom: "1px solid",
        borderColor: "SEPERATOR_GREY",
        cursor: "pointer",
      },
    },
    lastWrapper: {
      sx: {border: "none", cursor: "pointer"},
    },
    iconWrapper: {
      width: "26px",
      mr: "20px",
    },
    dataWrapper: {
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    data: {
      fontSize: ["14px", "16px", "18px"],
      mr: "8px",
    },
    dataSubText: {
      mt: "4px",
      fontSize: "13px",
      color: "TEXT_GREY",
      fontFamily: "secondary",
      sx: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },
    rightChevron: {
      flexShrink: 0,
    },
    recurringContainer: {
      display: "flex",
    },
    recurringText: {
      color: "SUCCESS_TEXT_GREEN",
      paddingTop: "5px",
      paddingRight: "5px",
    },
    cancelledText: {
      color: "ERROR_RED",
      paddingTop: "5px",
    },
  },
};

export default orderSectionStyles;
