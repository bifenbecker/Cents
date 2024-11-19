import React from "react";
import PropTypes from "prop-types";
import {Card, Button, Flex} from "rebass/styled-components";

const PillWithButton = props => {
  const {title, children, onClick} = props;

  return (
    <Card {...styles.cardContainer}>
      <Flex {...styles.content}>{children}</Flex>
      <Flex {...styles.footer.wrapper}>
        <Button variant="primary" {...styles.footer.button} onClick={onClick}>
          {title}
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
      boxShadow:
        "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
      mt: "18px",
    },
  },
  content: {
    justifyContent: "center",
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

PillWithButton.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any,
  onClick: PropTypes.func.isRequired,
};

export default PillWithButton;
