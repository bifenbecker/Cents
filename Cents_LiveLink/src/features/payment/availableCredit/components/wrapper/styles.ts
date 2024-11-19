import {sectionStyles} from "components/online-order/business/online-order-form/finishing-up/styles";

const styles = {
  section: sectionStyles,
  sectionHeader: {
    m: "0",
    p: "20px 18px",
    bg: "rgb(234, 241, 250)",
    fontSize: "14px",
    width: "100%",
  },
  wrapperModal: {
    justifyContent: "space-between",
    width: "100%",
    height: "80%",
    sx: {
      flexDirection: "column",
      alignItems: "center",
    },
    p: "18px",
  },
  wrapperContent: {
    sx: {
      flexDirection: "column",
    },
  },
  normalText: {
    fontSize: "16px",
    color: "BLACK",
    fontFamily: "secondary",
    paddingRight: "3px",
  },
  boldText: {
    fontWeight: "bold",
    display: "inline",
  },
  saveButton: {
    sx: {
      width: "100%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    p: "18px",
  },
};

export default styles;
