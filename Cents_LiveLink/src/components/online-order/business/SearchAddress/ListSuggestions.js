import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {ListItem, CircularProgress, Divider, List, Box} from "@material-ui/core";
import {useAppSelector} from "app/hooks";
import {onlineOrderSelectors} from "components/online-order/redux";
import SavedAddressSuggestion from "./SavedAddressSuggestion";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    padding: 0,
    display: "flex",
    position: "relative",
    flexDirection: "column",
    justifyContent: "space-around",
  },
  listItem: {
    padding: "12px 16px",
    backgroundColor: "white",
  },
  lastItem: {
    padding: "12px 16px",
    "@media (max-width: 500px)": {
      backgroundColor: "white",
    },
  },
  listSavedItems: {
    "&:first-child": {
      padding: "24px 16px 12px",
    },
  },
  loadingCurcularWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "rgba(207, 207, 207, .3)",
  },
}));

const ListSuggestions = ({
  suggestions,
  getSuggestionItemProps,
  onClickItem,
  children,
  loadingId,
}) => {
  const theme = useAppSelector(onlineOrderSelectors.getBusinessTheme);
  const latestAddress = useAppSelector(onlineOrderSelectors.getLatestAddress);
  const classes = useStyles(theme);

  const orderAddresses = (addresses) => {
    addresses = addresses.filter((address) => address.id !== latestAddress.id);
    return [latestAddress, ...addresses];
  };

  return (
    <List component="nav" className={classes.root}>
      {suggestions &&
        orderAddresses(suggestions).map((suggestion, index, suggestions) => {
          return (
            <>
              <ListItem
                button
                className={[
                  suggestions.length - 1 === index ? classes.lastItem : classes.listItem,
                  children.type.name === SavedAddressSuggestion.name
                    ? classes.listSavedItems
                    : null,
                ]}
                key={suggestion.id}
              >
                {React.cloneElement(children, {
                  suggestion: {
                    ...suggestion,
                    isActive: suggestion.id === latestAddress.id, // !TODO Check last success near stores checked address from redux
                  },
                  getSuggestionItemProps: getSuggestionItemProps,
                  onClick: onClickItem,
                })}
                {loadingId === suggestion.id &&
                children.type.name === SavedAddressSuggestion.name ? (
                  <Box className={classes.loadingCurcularWrapper}>
                    <CircularProgress />
                  </Box>
                ) : null}
              </ListItem>

              {/* Last element */}
              {suggestions.length - 1 === index ? null : (
                <Divider style={{margin: "0 16px"}} />
              )}
            </>
          );
        })}
    </List>
  );
};

export default ListSuggestions;
