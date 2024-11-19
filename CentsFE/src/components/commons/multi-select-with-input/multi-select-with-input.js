import React, {useState, useMemo, useEffect} from "react";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faUser} from "@fortawesome/free-solid-svg-icons";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {ReactComponent as Category} from "../../../assets/images/Category.svg";
import difference from "lodash/difference";
import PropTypes from "prop-types";

import {useToggle} from "../../../utils/hooks";

import Checkbox from "../checkbox/checkbox";
import TextField from "../textField/textField";

const CustomDropdownToggle = ({
  label,
  display,
  toggleElement,
  className,
  categoryIcon,
}) => {
  const suffix = <FontAwesomeIcon icon={faChevronRight} />;
  const prefix = <Category />;

  if (toggleElement) {
    return toggleElement({label, display, suffix});
  }

  return (
    <TextField
      className={`reports-dropdown ${className}`}
      label={label}
      value={display}
      readOnly
      suffix={suffix}
      prefix={categoryIcon ? prefix : null}
    />
  );
};

// TODO: Commented since customer selection will not be needed while creating a tier anymore.

// const CustomDropdownToggleV2 = ({
//   label,
//   display,
//   toggleElement,
//   className,
//   onTextChange,
// }) => {
//   const suffix = <FontAwesomeIcon icon={faChevronDown} />;

//   if (toggleElement) {
//     return toggleElement({label, display, suffix});
//   }

//   return (
//     <TextField
//       className={`reports-dropdown ${className}`}
//       label={label}
//       readOnly
//       onChange={(e) => onTextChange(e.target.value)}
//       suffix={suffix}
//       prefix={<FontAwesomeIcon icon={faUser} />}
//     />
//   );
// };
const MultiSelectWithInput = (props) => {
  const {
    label,
    options,
    header,
    value,
    allItemsLabel,
    onChange,
    showSelectedItems,
    itemName,
    toggleElement,
    showNoneLabel,
    className,
    isPickupDeliveryDropdown,
    // onTextChange,
    // isCustomerSelection,
    isOptionsLoading,
    categoryIcon,
  } = props;

  const {isOpen, toggle} = useToggle();
  const [selectedValues, setSelectedValues] = useState(value || []);
  const [allOptionsChecked, setAllOptionsChecked] = useState();

  const optionValues = useMemo(() => options.map(({value}) => value), [options]);

  useEffect(() => {
    setSelectedValues(value || []);
  }, [value]);

  useEffect(() => {
    setAllOptionsChecked(!difference(optionValues, selectedValues).length);
  }, [optionValues, selectedValues]);

  const handleOnChange = (opt) => {
    let selectedValuesCopy = [...selectedValues];
    const idx = selectedValuesCopy.findIndex((v) => v === opt.value);
    if (idx === -1) {
      if (isPickupDeliveryDropdown) {
        selectedValuesCopy = [opt.value];
      } else {
        selectedValuesCopy = [...selectedValuesCopy, opt.value];
      }
    } else {
      if (!isPickupDeliveryDropdown) {
        selectedValuesCopy.splice(idx, 1);
      }
    }
    setSelectedValues(selectedValuesCopy);
    onChange(selectedValuesCopy);
  };

  const handleAllItemsClick = () => {
    const finalValues = allOptionsChecked ? [] : optionValues;
    setSelectedValues(finalValues);
    onChange(finalValues);
  };

  const setDropdownDisplay = useMemo(() => {
    let displayValue = "";
    if (isPickupDeliveryDropdown) {
      displayValue =
        selectedValues.length === 0
          ? ""
          : allOptionsChecked
          ? itemName
          : options.filter(({value}) => selectedValues.includes(value))[0]?.label;
    } else {
      displayValue = showSelectedItems
        ? options
            .filter(({value}) => selectedValues.includes(value))
            .map(({label}) => label)
            .join(", ")
        : selectedValues.length === 0
        ? showNoneLabel
          ? "None Selected"
          : ""
        : allOptionsChecked
        ? `All (${options.length}) ${itemName}`
        : `${selectedValues.length} ${itemName}`;
    }
    return displayValue;
  }, [
    isPickupDeliveryDropdown,
    selectedValues,
    allOptionsChecked,
    itemName,
    options,
    showSelectedItems,
    showNoneLabel,
  ]);

  return (
    <Dropdown isOpen={isOpen} toggle={toggle} className="multi-select-with-input">
      <DropdownToggle tag="div">
        {/* // TODO: Commented since customer selection will not be needed while creating a tier anymore. */}

        {/* {isCustomerSelection ? (
          <CustomDropdownToggleV2
            label={label}
            toggleElement={toggleElement}
            className={className}
            onTextChange={onTextChange}
          />
        ) : ( */}
        <CustomDropdownToggle
          label={label}
          display={setDropdownDisplay}
          toggleElement={toggleElement}
          className={className}
          categoryIcon={categoryIcon}
        />
        {/* )} */}
      </DropdownToggle>
      <DropdownMenu
        className={isPickupDeliveryDropdown ? "pickup-delivery-dropdown" : ""}
      >
        {header && (
          <>
            <DropdownItem header>{header}</DropdownItem>
            <DropdownItem divider />
          </>
        )}
        {allItemsLabel && (
          <DropdownItem
            key="all"
            onClick={handleAllItemsClick}
            toggle={false}
            className="option-with-checkbox"
          >
            <Checkbox checked={allOptionsChecked} />
            <span className="label">{allItemsLabel}</span>
          </DropdownItem>
        )}
        {isOptionsLoading ? (
          <div className={"option-loading-container"}>
            <p className={"loading-label"}>Loading...</p>
          </div>
        ) : (
          options.map((opt) => (
            <DropdownItem
              key={opt.value}
              onClick={() => handleOnChange(opt)}
              toggle={false}
              className={`option-with-checkbox ${
                opt?.isCommercialCustomer ? "disabled" : ""
              }`}
            >
              <Checkbox checked={value.includes(opt.value)} />
              {/* <div className="label-info"> */}
              <span className="label">{opt.label}</span>
              {/* // TODO: Commented since customer selection will not be needed while creating a tier anymore. */}
              {/* {opt?.isCommercialCustomer && (
                  <span className="label-error-info">
                    This customer is already part of another tier
                  </span>
                )} */}
              {/* </div> */}
            </DropdownItem>
          ))
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

MultiSelectWithInput.propTypes = {
  label: PropTypes.string,
  categoryIcon: PropTypes.bool,
  itemName: PropTypes.string,
  header: PropTypes.string,
  allItemsLabel: PropTypes.string,
  showSelectedItems: PropTypes.bool,
  showNoneLabel: PropTypes.bool,
  options: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  toggleElement: PropTypes.func,
  className: PropTypes.string,
  isPickupDeliveryDropdown: PropTypes.bool,
  // onTextChange: PropTypes.func,
  // isCustomerSelection: PropTypes.bool,
  isOptionsLoading: PropTypes.bool,
};

MultiSelectWithInput.defaultProps = {
  label: "Select",
  itemName: "item",
  showSelectedItems: false,
  showNoneLabel: false,
  header: "",
  allItemsLabel: "",
  toggleElement: null,
  isPickupDeliveryDropdown: false,
  // isCustomerSelection: false,
  isOptionsLoading: false,
};

export default MultiSelectWithInput;
