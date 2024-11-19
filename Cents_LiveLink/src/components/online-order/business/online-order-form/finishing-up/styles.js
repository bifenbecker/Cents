export const sectionStyles = {
  header: {
    p: "20px 18px",
    bg: "rgb(234, 241, 250)",
    fontSize: "14px",
  },
  link: {
    wrapper: {
      p: "24px 0 16px",
      m: "0 18px",
      alignItems: "center",
      sx: {
        borderBottom: "1px solid",
        borderColor: "SEPERATOR_GREY",
        cursor: "pointer",
      },
    },
    lastWrapper: {
      flexDirection: "row",
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
      minWidth: "130px",
    },
    itallicData: {
      fontStyle: "italic",
      fontSize: ["14px", "16px"],
      mr: "8px",
    },
    laundryData: {
      fontStyle: "italic",
      fontSize: ["12px", "14px"],
      color: "TEXT_GREY",
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
        textAlign: "left",
      },
    },
    padding: {
      p: "24px 18px",
    },
    imagesConatiner: {
      alignItems: "center",
    },
    rightChevron: {
      flexShrink: 0,
    },
    paymentRequired: {
      sx: {
        mr: "20px",
      },
    },
    otherPaidInfo: {
      fontFamily: "secondary",
      pb: [1, 1],
      fontSize: [1, 2],
      justifyContent: "space-between",
      lineHeight: 2,
      fontWeight: "normal",
      color: "TEXT_GREY",
      padding: "24px 0 0px",
      margin: "0px 18px -18px 18px",
    },
    recurringText: {
      color: "SUCCESS_TEXT_GREEN",
      pt: "5px",
    },
  },
};
