import React from "react";
import {Text} from "rebass/styled-components";

import {ToggleButton} from "../../../../../common";

const ModifierButton = props => {
  const {modifier, checked, ...rest} = props;

  return (
    <ToggleButton
      {...rest}
      {...(checked ? styles.checkedButton : styles.uncheckedButton)}
      sx={{
        ...rest.sx,
        ...(checked ? styles.checkedButton.sx : styles.uncheckedButton.sx),
      }}
      checked={checked}
    >
      <Text {...styles.titleText}>{modifier?.name}</Text>
      <Text {...styles.subtext}>{`+$${modifier?.price?.toFixed(2)} / lb`}</Text>
    </ToggleButton>
  );
};

const styles = {
  titleText: {
    fontFamily: "primary",
    fontWeight: "bold",
  },
  subtext: {
    fontSize: "12px",
    color: "TEXT_GREY",
    mt: "6px",
  },
  checkedButton: {
    color: "BLACK",
    sx: {
      borderWidth: "4px",
    },
  },
  uncheckedButton: {
    fontFamily: "primary",
    sx: {
      boxShadow:
        "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
      border: "none",
    },
  },
};

export default ModifierButton;
