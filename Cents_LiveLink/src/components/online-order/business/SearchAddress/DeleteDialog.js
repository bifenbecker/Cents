import React from "react";
import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import {Typography, Box} from "@material-ui/core";

import {useAppDispatch} from "app/hooks";

import {deleteCustomerAddress} from "api/online-order";

import {useMediaQuery} from "@material-ui/core";
import {onlineOrderActions, onlineOrderThunks} from "components/online-order/redux";

const useStyles = makeStyles((theme) => {
  const PRIMARY_COLOR = theme.colors.primary;
  return {
    backDrop: {
      backdropFilter: "blur(16px)",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    dialogActions: {
      display: "flex",
      justifyContent: "space-around",
      padding: 0,
      margin: "0 auto 45px",
    },
    dialogTitle: {
      fontWeight: "700",
      fontSize: 16,
      textAlign: "center",
      color: "#303651",
      width: "80%",
      margin: "16px auto 8px",
    },
    dialogContentText: {
      fontWeight: 400,
      fontSize: 14,
      textAlign: "center",
      color: "#303651",
      margin: "0 auto 24px",
    },
    dialogContent: {
      padding: 0,
      height: "50px",
      flex: "0 1 auto",
    },
    buttonCancel: {
      border: "1.5px solid #3790F4",
      borderRadius: 31,
      padding: "16px 24px",
      minWidth: 159,
      width: "0.42%",
      color: PRIMARY_COLOR,
      borderColor: PRIMARY_COLOR,
      fontWeight: 700,
      fontSize: 16,
      "&:hover": {
        boxShadow:
          "0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12), 0px 5px 5px -3px rgba(0, 0, 0, 0.2)",
      },
    },
    buttonDelete: {
      border: "1.5px solid #3790F4",
      borderRadius: 31,
      padding: "16px 24px",
      minWidth: 159,
      width: "0.42%",
      color: "white",
      backgroundColor: PRIMARY_COLOR,
      borderColor: PRIMARY_COLOR,
      fontWeight: 700,
      fontSize: 16,
      "&:hover": {
        backgroundColor: PRIMARY_COLOR,
        boxShadow:
          "0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12), 0px 5px 5px -3px rgba(0, 0, 0, 0.2)",
      },
    },
    dialogPaper: {
      width: "375px",
      height: "212px",
      overflowY: "inherit",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
      borderRadius: 24,
    },
    dialogPaperMobile: {
      width: "100%",
      height: "212px",
      overflowY: "inherit",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
      margin: 0,
      position: "absolute",
      bottom: 0,
      borderRadius: "0px 0px 24px 24px",
    },
  };
});

const DeleteDialog = ({isOpen, handleClose, address}) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery("(max-width: 500px)");

  const handleDeleteAddress = async (event) => {
    try {
      await dispatch(onlineOrderThunks.deleteCustomerAddressInfo(address.id));
      handleClose();
    } catch (error) {
      console.error(`Error! ${error}`);
    }
    event.stopPropagation();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      PaperProps={{className: isMobile ? classes.dialogPaperMobile : classes.dialogPaper}}
      BackdropProps={{
        classes: {
          root: classes.backDrop,
        },
      }}
    >
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography className={classes.dialogTitle}>
          Are you sure you want to delete this address?
        </Typography>
      </Box>
      <Box className={classes.dialogContent}>
        <Typography className={classes.dialogContentText}>
          All the details you entered will be lost
        </Typography>
      </Box>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose} className={classes.buttonCancel}>
          Cancel
        </Button>
        <Button onClick={handleDeleteAddress} className={classes.buttonDelete}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
