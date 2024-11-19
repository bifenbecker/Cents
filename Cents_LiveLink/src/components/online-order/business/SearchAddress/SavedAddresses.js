import {alpha} from "@material-ui/core/styles/colorManipulator";
import {Box, Typography} from "@material-ui/core";
import {useAppSelector} from "app/hooks";
import {makeStyles} from "@material-ui/core/styles";
import ListSuggestions from "./ListSuggestions";
import SavedAddressSuggestion from "./SavedAddressSuggestion";
import {onlineOrderSelectors} from "components/online-order/redux";
import {useMediaQuery} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  savedAddressesWrapper: {
    width: "100%",
    height: "54px",
    backgroundColor: alpha(theme.colors.primary, 0.1),
    position: "relative",
  },
  savedAddressesText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#303651",
    position: "absolute",
    top: "50%",
    transform: "translate(0, -50%)",
    marginLeft: "16px",
  },
  loadingWrapper: {
    width: "100%",
    height: "100px",
    backgroundColor: "rgba(207, 207, 207, .3)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const SavedAddresses = ({onClickItem, handleEdit, clearInput, loadingId}) => {
  const {
    data: {savedCustomerAddresses: addresses},
  } = useAppSelector(onlineOrderSelectors.getOrderInitialData);
  const {data: theme} = useAppSelector(onlineOrderSelectors.getBusinessTheme);
  const style = useStyles(theme);
  const isMobile = useMediaQuery("(max-width: 500px)");

  return (
    Object.keys(addresses || {}).length !== 0 && (
      <>
        <Box className={style.savedAddressesWrapper}>
          <Typography className={style.savedAddressesText}>Saved Addresses</Typography>
        </Box>
        <ListSuggestions
          suggestions={isMobile ? addresses : addresses?.slice(-3)}
          onClickItem={onClickItem}
          loadingId={loadingId}
        >
          <SavedAddressSuggestion handleEdit={handleEdit} clearInput={clearInput} />
        </ListSuggestions>
      </>
    )
  );
};

export default SavedAddresses;
