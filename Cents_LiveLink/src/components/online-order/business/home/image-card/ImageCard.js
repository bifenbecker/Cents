import React from "react";
import {makeStyles} from "@material-ui/styles";

import {Image} from "rebass";

import {LastOrderCard} from "./LastOrderCard";
import homeImage from "assets/images/business/home.svg";
import {Box, Grid} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  cardWrapper: {
    margin: "24px auto",
    "@media (max-height: 715px)": {
      height: "calc(208px + 115px)",
    },
  },
  image: {
    width: 266,
  },
}));

export const ImageCard = ({isFirstVisit, orderDetails, handleReorderButtonClick}) => {
  const classes = useStyles();
  return (
    <Box className={classes.cardWrapper} id="image-wrapper">
      {isFirstVisit ? (
        <Grid container justifyContent="center">
          <Image src={homeImage} alt="Home Image" className={classes.image} />
        </Grid>
      ) : (
        <LastOrderCard
          orderDetails={orderDetails}
          handleReorderButtonClick={handleReorderButtonClick}
        />
      )}
    </Box>
  );
};
