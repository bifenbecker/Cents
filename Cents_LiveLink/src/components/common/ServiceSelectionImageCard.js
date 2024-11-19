import React from "react";
import PropTypes from "prop-types";
import {Button, Flex, Text, Image} from "rebass/styled-components";
import {CircleButton} from "../../assets/images";

const ServiceSelectionImageCard = (props) => {
  const {
    imageSource,
    title,
    itemSelected,
    activeStateImage,
    onClick,
    illustrationDimensions,
  } = props;

  return (
    <Flex {...styles.cardContainer} onClick={onClick}>
      <Flex {...styles.content}>
        {itemSelected ? (
          <Button {...styles.greenCheckButton}>
            <Image src={activeStateImage} />
          </Button>
        ) : (
          <Image src={CircleButton} />
        )}
        <Text>{title}</Text>
        <Image
          src={imageSource}
          height={illustrationDimensions.height}
          width={illustrationDimensions.width}
        />
      </Flex>
    </Flex>
  );
};

const styles = {
  cardContainer: {
    sx: {
      height: "120px",
      width: "100%",
      p: "18px",
      borderRadius: "24px",
      boxShadow:
        "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
    },
  },
  content: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  roundButton: {
    height: "46px",
    width: "46px",
    flexShrink: "0",
    ml: "8px",
    sx: {
      borderRadius: "100vh",
    },
  },
  greenCheckButton: {
    height: "46px",
    width: "46px",
    flexShrink: "0",
    sx: {
      borderRadius: "100vh",
      backgroundColor: "#3EA900",
    },
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

ServiceSelectionImageCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any,
  onClick: PropTypes.func.isRequired,
};

export default ServiceSelectionImageCard;
