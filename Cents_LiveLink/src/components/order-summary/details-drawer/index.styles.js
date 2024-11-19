const styles = {
  title: {
    justifyContent: "center",
    bg: "WHITE",
    height: "40px",
    alignItems: "center",
    flex: 1,
    width: "100%",
    sx: {
      position: "absolute",
      top: 0,
      cursor: "grab",
      borderTopRightRadius: "8px",
      borderTopLeftRadius: "8px",
    },
  },
  drawerPullUp: {
    height: "6px",
    bg: "#D8D8D8",
    width: "3.1rem",
    sx: {
      borderRadius: "50px",
    },
  },
  content: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  footerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    bg: "WHITE",
  },
  contentWrapper: {
    padding: "18px",
  },
  fixedContentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  fixedContentBox: {
    sx: {
      boxShadow: "0 -5px 8px -7px rgba(0,0,0,.2)",
    },
    height: "3rem",
    bg: "WHITE",
  },
  flexWrapper: {
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
    width: "100%",
  },
  tipBox: {
    height: "4rem",
  },
  toggleButton: {
    py: ["0.3rem", "0.4rem"],
    px: ["0.75", "1rem"],
    fontSize: ["12px", "14px"],
    mr: "0.6rem",
  },
  fixedContentTitle: {
    color: "BLACK",
    mr: "1.5rem",
  },
  paymentNote: {
    fontSize: "12px",
    p: "1rem",
    pt: "0",
    fontFamily: "secondary",
  },
  poweredByCentsWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    padding: "0 0.75rem",
    bg: "WHITE",
  },
  poweredByCents: {
    fontFamily: "Roboto Bold",
    width: "100%",
    color: "TEXT_GREY",
    textAlign: "center",
    py: "10px",
    fontSize: "0.75rem",
  },
};

export default styles;
