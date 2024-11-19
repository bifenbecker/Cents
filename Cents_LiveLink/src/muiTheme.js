import {createTheme} from "@material-ui/core/styles";

// A custom theme for this app
const muiTheme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#3d98ff",
      light: "#3d98ff",
      dark: "#3d98ff",
    },
  },
  overrides: {
    MuiTextField: {
      root: {
        margin: "5px",
        backgroundColor: "#fff",
        width: "100%",
      },
    },
  },
});

export default muiTheme;
