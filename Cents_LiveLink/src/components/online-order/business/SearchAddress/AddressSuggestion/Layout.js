import {Box, Typography, CircularProgress} from "@material-ui/core";
import {Image} from "rebass/styled-components";
import locationIcon from "../icons/location.svg";
import {makeStyles} from "@material-ui/styles";

const useStyle = makeStyles((theme) => ({
  wrapper: {
    height: "59px",
    maxHeight: "59px",
    width: "100%",
    zIndex: 8,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  typography: {
    height: "100%",
    width: "90%",
    fontSize: "14px",
    fontWeight: "400",
    color: "#303651",
    wordWrap: "break-word",

    display: "-webkit-box",
    "-webkit-line-clamp": 2,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 200,
  },
  activeTypography: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
}));

const Layout = ({key, inputProps, text, children, isActive = false}) => {
  const classes = useStyle();

  return (
    <Box className={classes.wrapper} key={key} {...inputProps}>
      <Box display="flex" alignItems="flex-start" sx={{gap: "10px"}}>
        <Image src={locationIcon} style={{marginTop: "2px", marginLeft: "2px"}} />
        <Typography
          className={[classes.typography, isActive ? classes.activeTypography : null]}
        >
          {text}
        </Typography>
      </Box>
      {children}
    </Box>
  );
};

export default Layout;
