const styles = {
  parentContainer: {
    overflow: "auto",
    height: "calc(100% - 140px - 42px)",
  },
  recurringContainer: {
    display: "flex",
    height: "42px",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E9F1FB",
    mb: "18px",
  },
  recurringText: {
    fontSize: "14px",
    color: "SUCCESS_TEXT_GREEN",
    pr: "8px",
  },
  subscriptionCTA: {
    fontSize: "14px",
    color: "CENTS_BLUE",
    sx: {
      textDecoration: "underline",
    },
  },
  scrollableContainer: {
    sx: {
      pb: "18px",
      mx: "18px",
    },
  },
  contentContainer: {
    height: "100%",
    pb: "100px",
    sx: {
      overflow: "scroll",
    },
  },
  footer: {
    errorMessage: {
      mt: "0px",
      mb: "8px",
    },
    mt: "auto",
    bg: "WHITE",
    sx: {
      position: "absolute",
      width: "100%",
      padding: "18px",
      bottom: 0,
      left: 0,
      boxShadow: "0 -5px 8px -7px rgba(0,0,0,0.2)",
      paddingTop: "0",
    },
    footerTimeWindowContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      px: "10px",
      pb: "5px",
    },
  },
  button: {
    width: "100%",
    height: "56px",
    mt: "18px",
    sx: {
      textTransform: "uppercase",
    },
  },
  cancellationText: {
    sx: {
      fontFamily: "primary",
      fontSize: "14px",
      color: "CENTS_BLUE",
      textDecoration: "underline",
      cursor: "pointer",
    },
    py: "2px",
  },
  employeeCounterIntake: {
    m: "auto",
  },
  turnAroundTimeWrapper: {
    sx: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
  },
};

export default styles;
