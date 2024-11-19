import React from "react";
import {Button, Flex, Text} from "rebass/styled-components";

const NumberCounter = props => {
  const {onCountChange, count, max, measure, step = 1} = props;

  /**
   * Add step to the current count
   */
  const increment = () => {
    if (count <= max) {
      return onCountChange(count + step);
    }
  };

  /**
   * Subtract step from the current count if current count is greater than step
   */
  const decrement = () => {
    if (count > step) {
      return onCountChange(count - step);
    }
  };

  return (
    <Flex {...styles.counterRow}>
      <Button
        sx={{
          ...styles.minusContainer,
          backgroundColor: count === step ? "SEPARATOR_GREY" : "primary",
          borderRadius: "50%",
          alignItems: "center",
        }}
        onClick={decrement}
        disabled={count === step}
      >
        &minus;
      </Button>
      <Text {...styles.number} px={"12px"}>
        {count}
        {!!measure && <Text>{measure}</Text>}
      </Text>
      <Button {...styles.plusContainer} onClick={increment} disabled={count === max}>
        &#43;
      </Button>
    </Flex>
  );
};

const styles = {
  counterRow: {
    sx: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
  },
  minusContainer: {
    width: "43px",
    height: "43px",
    fontFamily: "Roboto",
    fontSize: "33px",
    lineHeight: "33px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "6px",
  },
  plusContainer: {
    width: "43px",
    height: "43px",
    sx: {
      backgroundColor: "primary",
      borderRadius: "100vh",
      fontFamily: "Roboto",
      fontSize: "33px",
      lineHeight: "33px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "6px",
    },
  },
  actionIcon: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
      color: "#FFFFFF",
      textAlign: "center",
      fontSize: "24px",
      fontFamily: "secondary",
    },
  },
  number: {
    textAlign: "center",
    sx: {
      fontFamily: "secondary",
      fontWeight: "600",
    },
  },
};

export default NumberCounter;
