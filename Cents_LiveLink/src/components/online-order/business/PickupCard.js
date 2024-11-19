import React from "react";
import {Flex, Text, Image, Card, Button} from "rebass/styled-components";
import PropTypes from "prop-types";

import {BlueCheckedIcon, BlueVan} from "../../../assets/images/index";

const PickupCard = props => {
  const {onScheduleClick} = props;

  return (
    <Card {...styles.cardContainer}>
      <Flex {...styles.contentContainer}>
        <Flex {...styles.textContainer}>
          <Text>
            <Image src={BlueCheckedIcon} {...styles.completeIcon}></Image> We can pickup
            from this address!
          </Text>
        </Flex>
        <Image src={BlueVan} {...styles.imageStyles}></Image>
      </Flex>

      <Flex {...styles.footer.wrapper}>
        <Button variant="primary" {...styles.footer.button} onClick={onScheduleClick}>
          Schedule Pickup
        </Button>
      </Flex>
    </Card>
  );
};

const styles = {
  cardContainer: {
    sx: {
      width: "100%",
      p: "18px",
      borderRadius: "24px",
      // backgroundColor: "#FAFAFA",
      boxShadow:
        "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
      mt: "18px",
    },
  },
  textContainer: {
    flex: "1",
    fontSize: ["16px", "18px"],
  },
  completeIcon: {
    width: ["16px", "18px"],
    pr: "4px",
  },
  imageStyles: {
    width: "120px",
  },
  contentContainer: {
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  footer: {
    wrapper: {
      width: "100%",
      mt: "auto",
      alignItems: "center",
      justifyContent: "center",
      pt: "18px",
    },
    button: {
      width: "100%",
      height: "48px",
      fontSize: "16px",
      sx: {
        textTransform: "uppercase",
      },
    },
  },
};

PickupCard.propTypes = {
  onScheduleClick: PropTypes.func.isRequired,
};

export default PickupCard;
