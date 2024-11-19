import React, {useEffect, useMemo, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import PropTypes from "prop-types";

import TextField from "../textField/textField";

const maxStopLabels = {unlimited: "Unlimited", setCustom: "Set Custom"};
const maxStopOptions = [maxStopLabels.unlimited, maxStopLabels.setCustom];

const MaxStopsDropdown = ({maxStops: initMaxStops, onMaxStopsChange}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    initMaxStops ? maxStopLabels.setCustom : maxStopLabels.unlimited
  );
  const [maxStops, setMaxStops] = useState(initMaxStops);
  const menuRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    setSelectedOption(initMaxStops ? maxStopLabels.setCustom : maxStopLabels.unlimited);
    setMaxStops(initMaxStops);
  }, [initMaxStops]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    if (option === maxStopLabels.unlimited) {
      onMaxStopsChange(null);
      setMaxStops(null);
    }
  };

  const setCurrentMaxStops = (customMaxStops) => {
    if (customMaxStops === maxStopLabels.unlimited || !customMaxStops) {
      setSelectedOption(maxStopLabels.unlimited);
      onMaxStopsChange(null);
      setMaxStops(null);
      return;
    }
    onMaxStopsChange(Number(customMaxStops));
    setSelectedOption(maxStopLabels.setCustom);
    setMaxStops(Number(customMaxStops));
  };

  /**
  * Input blur will trigger everytime, the focus of the input is gone.
  * This will happen, when we click on the dropdown item.
  * Hence, other dropdown item, if anything else is clicked,
  * then call the input blur and change the time input

  * Force the focus after the input is updated from dropdown-item.
  * This would fix the focus jittering thing.
  */
  const handleInputBlur = (event) => {
    const {value: customMaxStops} = event.target;
    if (event.relatedTarget && event.relatedTarget.classList[0] === "dropdown-item") {
      event.target.focus();
      return;
    }
    setCurrentMaxStops(customMaxStops);
  };

  const onInputChange = (event) => {
    const customMaxStops = event?.target?.value?.replace(/[^0-9]/g, "");
    // Input can be changed only for set custom option
    if (selectedOption === maxStopLabels.setCustom) {
      setMaxStops(Number(customMaxStops));
    } else {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const toggleDropdown = () => {
    if (
      selectedOption === maxStopLabels.unlimited ||
      (selectedOption === maxStopLabels.setCustom && isOpen)
    ) {
      setIsOpen(!isOpen);
    }
  };

  const onSuffixClicked = (event) => {
    setIsOpen(!isOpen);
  };

  const inputValue = useMemo(() => {
    if (selectedOption === maxStopLabels.unlimited) {
      return maxStopLabels.unlimited;
    }
    return maxStops || "";
  }, [maxStops, selectedOption]);

  return (
    <div className="max-stops-with-input-dropdown-container">
      <Dropdown
        isOpen={isOpen}
        toggle={toggleDropdown}
        className={["max-stops-input-dropdown", "small"].filter((cx) => cx).join(" ")}
      >
        <DropdownToggle tag="div" className="max-stops-toggle-container">
          <TextField
            label="Max.stops"
            value={inputValue}
            onChange={onInputChange}
            onBlur={handleInputBlur}
            suffix={
              <FontAwesomeIcon
                className="max-stops-down-arrow"
                icon={faChevronDown}
                onClick={onSuffixClicked}
              />
            }
            className={"max-stops-input"}
            ref={inputRef}
            maxLength={5}
          />
        </DropdownToggle>
        <DropdownMenu>
          <div className="dropdown-menu-container wrapper-dropdown" ref={menuRef}>
            {maxStopOptions.map((opt) => (
              <DropdownItem
                key={opt}
                onClick={() => handleOptionChange(opt)}
                active={selectedOption === opt}
              >
                <span>{opt}</span>
              </DropdownItem>
            ))}
          </div>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

MaxStopsDropdown.propTypes = {
  maxStops: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onMaxStopsChange: PropTypes.func.isRequired,
};

MaxStopsDropdown.defaultProps = {
  maxStops: null,
  onMaxStopsChange: () => {},
};

export default MaxStopsDropdown;
