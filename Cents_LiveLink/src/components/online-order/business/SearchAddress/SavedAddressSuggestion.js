import React, {useState} from "react";
import {Box} from "@material-ui/core";
import {Image} from "rebass/styled-components";
import editIcon from "./icons/edit.svg";
import deleteIcon from "./icons/Delete.svg";
import Layout from "./AddressSuggestion/Layout";
import {getFormattedAddress} from "./utils";
import DeleteDialog from "./DeleteDialog";
import {useMediaQuery} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";

const useStyle = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    justifyContent: "space-between",
    gap: 17,
  },
  icon: {
    height: 15,
    width: 15,
  },
  iconMobile: {
    height: 20,
    width: 20,
  },
}));

const SavedAddressSuggestion = ({
  suggestion,
  getSuggestionItemProps = null,
  onClick,
  handleEdit,
  clearInput,
}) => {
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const isMobile = useMediaQuery("(max-width: 500px)");
  const classes = useStyle();

  const onClickHandler = () => {
    onClick({
      isNew: false,
      name: getFormattedAddress(suggestion),
      details: suggestion,
    });
  };

  const onEditAddress = (event) => {
    handleEdit({
      isNew: false,
      name: getFormattedAddress(suggestion),
      details: suggestion,
    });
    event.stopPropagation();
  };

  const onDeleteAddress = (event) => {
    setIsOpenDeleteDialog(true);
    event.stopPropagation();
  };

  const handleCloseDeleteDialog = (event) => {
    setIsOpenDeleteDialog(false);
    event.stopPropagation();
  };

  const inputProps = getSuggestionItemProps ? getSuggestionItemProps(suggestion, {}) : {};

  return (
    <Layout
      key={suggestion.id}
      inputProps={{...inputProps, onClick: onClickHandler}}
      text={getFormattedAddress(suggestion)}
      isActive={suggestion.isActive}
    >
      <Box className={classes.wrapper}>
        <Image
          src={editIcon}
          onClick={onEditAddress}
          className={isMobile ? classes.iconMobile : classes.icon}
        />
        <Image
          src={deleteIcon}
          onClick={onDeleteAddress}
          className={isMobile ? classes.iconMobile : classes.icon}
        />
        <DeleteDialog
          isOpen={isOpenDeleteDialog}
          handleClose={handleCloseDeleteDialog}
          address={suggestion}
          clearInput={clearInput}
        />
      </Box>
    </Layout>
  );
};

export default SavedAddressSuggestion;
