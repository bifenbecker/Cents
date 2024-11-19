import React from "react";
import {Image} from "rebass";
import mobileExitIcon from "../icons/Icon_Mobile_Exit.svg";
import {Typography, Box} from "@material-ui/core";

const Layout = ({
  children,
  title,
  onClose,
  isSelectAddress,
  isTyping,
  isCanPickupAddress,
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        width: "100vw",
        top: 0,
        left: 0,
        minHeight: "100%",
        bottom: "auto",
        zIndex: 999,
      }}
      bgcolor={
        isTyping
          ? isSelectAddress
            ? isCanPickupAddress
              ? "#FFFFFF"
              : "#F7F7F7"
            : "#FFFFFF"
          : "#F5F5F5"
      }
    >
      <Box
        sx={{
          width: "100%",
          padding: "20px 0 20px",
          display: "flex",
          alignItems: "center",
        }}
        bgcolor={
          isTyping
            ? isSelectAddress
              ? isCanPickupAddress
                ? "#FFFFFF"
                : "#F5F5F5"
              : "#F5F5F5"
            : "#F5F5F5"
        }
      >
        <Image
          src={mobileExitIcon}
          onClick={onClose}
          style={{position: "absolute", top: 18, left: 18, zIndex: 9}}
        />
        <Typography
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "600",
            color: "#303651",
            width: "100%",
            height: "24px",
            top: "56px",
            lineHeight: "22px",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default Layout;
