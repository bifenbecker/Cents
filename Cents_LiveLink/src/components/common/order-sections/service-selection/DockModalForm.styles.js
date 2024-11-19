const styles = {
  cardContainer: {
    height: "calc(100% - 96px - 67px)",
    sx: {
      overflow: "auto",
      width: "100%",
      p: " 0px 18px",
    },
  },
  boxContainer: {
    sx: {
      flexDirection: "column",
    },
  },
  wrapper: {
    mt: "8px",
    marginBottom: "120px",
    marginTop: "0px",
  },
  header: {
    fontSize: "18px",
    ml: "18px",
  },
  services: {
    wrapper: {
      display: "inline-block",
      width: "100%",

      sx: {
        overflowX: "auto",
        whiteSpace: "nowrap",
      },
    },
    button: {
      margin: "23px 0px",
      height: "122px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    modifierButton: {
      margin: "18px 0px",
      height: "62px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    checkedButton: {
      margin: "18px 0px",
      height: "62px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
  },
  servicesBox: {
    sx: {
      margin: "10px 18px 10px 18px",
      height: "122px",
      borderRadius: "31px",
      background: "#FFFFFF",
      boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
  },
  servicesType: {
    sx: {
      height: "21px",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: "18px",
      lineHeight: "21px",
      color: "#000000",
    },
  },
  saveButtonContainer: {
    sx: {
      margin: "0",
      minWidth: "0",
      position: "fixed",
      width: "100%",
      bottom: 0,
      left: 0,
      marginTop: "auto",
      boxShadow: "0 -5px 8px -7px rgba(0,0,0,0.2)",
      bg: "WHITE",
    },
  },
  saveButton: {
    sx: {
      backgroundColor: "#3D98FF",
      width: "100%",
      borderRadius: 31,
      textTransform: "uppercase",
      marginLeft: "18px",
      marginRight: "18px",
      boxShadow: "0px 5px 25px rgba(121, 120, 120, 0.248907)",
    },
    my: 34,
    py: 20,
  },
  footer: {
    wrapper: {
      p: "18px",
      alignItems: "center",
      justifyContent: "center",
      bg: "WHITE",
      sx: {
        zIndex: 49,
        position: "absolute",
        bottom: 0,
        width: "100%",
        boxShadow: "0 0 3px rgba(0, 0, 0, .25)",
        borderTopRightRadius: "6px",
        borderTopLeftRadius: "6px",
      },
    },
    button: {
      p: "18.5px",
      width: "100%",
    },
  },
  description: {
    sx: {
      fontStyle: "normal",
      fontSize: "16px",
      lineHeight: "21px",
      fontFamily: "secondary",
      pt: "18px",
      pb: "24px",
      color: "BLACK",
    },
  },
  seePricing: {
    color: "primary",
    sx: {
      display: "inline",
      textDecoration: "underline",
      fontFamily: "primary",
      cursor: "pointer",
    },
  },
  buttonContainer: {
    p: "12px 12px",
  },
};

export default styles;
