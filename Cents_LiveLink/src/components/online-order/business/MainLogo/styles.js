import {makeStyles} from "@material-ui/styles";

export default makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "24px auto",
    boxSizing: "border-box",
    "@media (max-width: 500px)": {
      width: "80%",
    },
    "@media (min-width: 500px)": {
      maxWidth: 400,
      width: "100%",
    },
  },
  logo: {
    objectFit: "contain",
    padding: "15px 0px",
    maxHeight: 200,
    marginTop: 20,
  },
}));
