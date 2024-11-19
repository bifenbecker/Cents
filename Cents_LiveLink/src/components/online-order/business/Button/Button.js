import {Button, Typography} from "@material-ui/core";
import useStyles from "./styles";
import {useMediaQuery} from "@material-ui/core";

const HomePageButton = (props) => {
  const {orderButton, orderButtonMobile, orderButtonTypography} = useStyles();
  const isMobile = useMediaQuery("(max-width: 500px)");
  return (
    <Button
      disabled={props.isCheckingAddress}
      id={props.id}
      variant="contained"
      color="primary"
      className={isMobile ? orderButtonMobile : orderButton}
      {...props}
    >
      <Typography className={orderButtonTypography}>{props.text}</Typography>
    </Button>
  );
};

export default HomePageButton;
