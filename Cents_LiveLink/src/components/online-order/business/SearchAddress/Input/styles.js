import {makeStyles} from "@material-ui/styles";

export default makeStyles((theme) => ({
  activeWrapper: {
    backgroundColor: "#F7F7F7",
    height: 88,
  },
  wrapperBorder: {
    borderRadius: 12,
  },
  shadow: {
    boxShadow:
      "0px 3px 14px 2px rgba(0, 0, 0, 0.12), 0px 5px 5px -3px rgba(0, 0, 0, 0.2)",
  },
  activeInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 55,
    width: "91.5%",
  },
  dropDownList: {
    borderRadius: "12px 12px 0 0",
  },
  staticWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 8,
  },
  staticInput: {
    "@media (max-width: 500px)": {
      width: 224,
      minWidth: 224,
    },
    "@media (min-width: 500px)": {
      width: 316,
      maxWidth: 316,
    },
  },
  inputPropsStyle: {
    fontSize: "16px",
    fontWeight: "400",
    textOverflow: "ellipsis",
    padding: "6px 0",
    margin: "0 8px 0 7px",
  },
  InputPropsStyle: {
    fontSize: "24px",
  },
  activeInputProps: {
    margin: "17px 13px 14px 17px",
  },
}));
