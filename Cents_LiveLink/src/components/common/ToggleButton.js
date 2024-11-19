import React from "react";
import {Button, Flex} from "rebass/styled-components";
import PropTypes from "prop-types";
import ToggleButtonRadioDecoration from "./ToggleButtonRadioDecoration";

const ToggleButton = (props) => {
  const {onChange, checked, colorText, sx, ...rest} = props;

  const render = ({withRadio, children, label, checked}) => {
    if (withRadio) {
      return (
        <Flex>
          <ToggleButtonRadioDecoration filled={checked} />
          {children || label}
        </Flex>
      );
    }
    return children || label;
  };

  return (
    <Button
      onClick={() => {
        if (onChange) onChange(!checked);
      }}
      variant={checked ? "thickOutline" : "outline"}
      color={colorText}
      sx={{borderColor: checked ? "primary" : "TEXT_GREY", ...sx}}
      {...rest}
    >
      {render(props)}
    </Button>
  );
};

ToggleButton.propTypes = {
  onChange: PropTypes.func,
  label: PropTypes.string,
  toggleOnColor: PropTypes.string,
  toggleOffColor: PropTypes.string,
  colorText: PropTypes.string,
  checked: PropTypes.bool,
  children: PropTypes.node,
  sx: PropTypes.object,
};

ToggleButton.defaultProps = {
  onChange: null,
  label: "Toggle",
  toggleOnColor: "primary",
  toggleOffColor: "secondary",
  colorText: "black",
  checked: false,
  sx: {},
};

export default ToggleButton;
