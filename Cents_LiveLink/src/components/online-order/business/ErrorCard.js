import React from "react";
import {Flex, Text, Image, Card} from "rebass/styled-components";
import {ClothesPile} from "../../../assets/images/index";

const ErrorCard = () => {
  return (
    <Card {...styles.cardContainer}>
      <Flex {...styles.contentContainer}>
        <Flex {...styles.textContainer}>
          <Text {...styles.text.headerText}>
            Sorry, we can't pick up from this address
          </Text>
        </Flex>
        <Flex {...styles.imageContainer}>
          <Image src={ClothesPile} {...styles.imageStyles}></Image>
        </Flex>
      </Flex>

      <Flex {...styles.footer.wrapper}>
        <Text {...styles.footer.text}>
          Your address is not in our delivery service area. If you'd like to drop off your
          laundry at our laundromat, we'll be happy to serve you!
        </Text>
      </Flex>
    </Card>
  );
};

const styles = {
  cardContainer: {
    sx: {
      background: "rgba(220, 86, 46, 0.1)",
      width: "calc(100% - 40px)",
      minHeight: "170px",
      p: "18px",
      border: "1.5px solid #DC562E",
      borderRadius: "12px",
      boxShadow:
        "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
      my: "18px",
      mx: "20px",
    },
  },
  textContainer: {
    flex: "1",
    fontSize: "18px",
  },
  text: {
    headerText: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#303651",
    },
  },
  imageStyles: {
    height: "80%",
  },
  imageContainer: {
    flex: "1",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    height: "92px",
    justifyContent: "space-between",
  },
  footer: {
    wrapper: {
      width: "100%",
      mt: "auto",
      alignItems: "flex-end",
      justifyContent: "center",
    },
    text: {
      fontFamily: "secondary",
      color: "#303651",
      fontWeight: "400",
      fontSize: "14px",
    },
  },
};

export default ErrorCard;
