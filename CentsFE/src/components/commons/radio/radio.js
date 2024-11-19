import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import SelectedRadioIcon from "../../../assets/images/Icon_Radio Button Selected.svg";
import UnselectedRadioIcon from "../../../assets/images/Icon_Radio Button Unselected.svg";
import SelectedRadioStrokeIcon from "../../../assets/images/Icon_Selected_Stroke.svg";

const Radio = ({selected, disabled, onChange, isTierPerZoneSelector}) => {
  return (
    <img
      alt="icon"
      className={cx("radio-icon", disabled ? "disabled" : "")}
      src={
        selected && isTierPerZoneSelector
          ? SelectedRadioStrokeIcon
          : selected
          ? SelectedRadioIcon
          : UnselectedRadioIcon
      }
      onClick={(event) => {
        if (!disabled) onChange(event);
      }}
    />
  );
};

Radio.propTypes = {
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  isTierPerZoneSelector: PropTypes.bool,
  onChange: PropTypes.func,
};

Radio.defaultProps = {
  selected: false,
  disabled: false,
  isTierPerZoneSelector: false,
  onChange: () => {},
};

export default Radio;
