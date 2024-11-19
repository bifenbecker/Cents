import {makeStyles} from "@material-ui/styles";

export default makeStyles((theme) => ({
  orderButton: {
    height: "62px",
    borderRadius: "31px",
    width: "100%",
  },
  orderButtonMobile: {
    height: "62px",
    borderRadius: "31px",
    width: "calc(100% - 38px)",
    // margin: "auto 19px",
    position: "absolute",
  },
  orderButtonTypography: {
    fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "20px",
    lineHeight: "28px",
    textAlign: "center",
    letterSpacing: "0.481481px",
    textTransform: "capitalize",
  },
}));
