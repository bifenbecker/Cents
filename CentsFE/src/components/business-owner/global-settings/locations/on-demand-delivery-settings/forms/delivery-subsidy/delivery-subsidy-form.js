import React, {useState} from "react";
import PropTypes from "prop-types";

import CentsInput from "../../../../../../commons/currency-input/cents-input";
import {subsidyTypes} from "../../../constants";

const DeliverySubsidyForm = (props) => {
  const {subsidyValueInCents, updateSubsidy, type, className} = props;

  const subsidyOptions = [
    {
      name: "No subsidy",
      value: "NO",
    },
    {
      name: "Yes, subsidize",
      value: "YES",
    },
  ];

  const [optionSelected, setOptionSelected] = useState(
    subsidyValueInCents ? subsidyOptions[1].value : subsidyOptions[0].value
  );

  const handleUpdateSubsidy = (option) => {
    setOptionSelected(option);
    if (option === subsidyOptions[0].value) {
      updateSubsidy(0);
    }
  };

  return (
    <div className={`delivery-subsidy__content ${className ? className : ""}`}>
      <header className="delivery-subsidy__header">
        {`Do you want to subsidize on-demand ${
          type === subsidyTypes.onlineOrders
            ? "pickup & delivery for online"
            : "return delivery for walk-in"
        } orders?`}
      </header>
      <div className="delivery-subsidy__radio-buttons-container">
        {subsidyOptions.map((item) => (
          <div key={item.name}>
            <small className="delivery-subsidy__list-selection-item">
              <input
                type="radio"
                name={type}
                value={item.value}
                checked={item.value === optionSelected}
                onChange={() => {
                  handleUpdateSubsidy(item.value);
                }}
              />
              {item.name}
            </small>
          </div>
        ))}
      </div>
      {optionSelected === "YES" ? (
        <CentsInput
          prefix="$"
          label={
            type === subsidyTypes.onlineOrders
              ? "Discount Amount Each Way"
              : "Return Delivery Only Discount"
          }
          className="flat-fee-input delivery-subsidy__centsInput"
          onCentsChange={updateSubsidy}
          maxLimit={9999.99}
          value={subsidyValueInCents}
        />
      ) : null}
    </div>
  );
};

DeliverySubsidyForm.propTypes = {
  subsidyValueInCents: PropTypes.number,
  updateSubsidy: PropTypes.func,
  type: PropTypes.string,
};

DeliverySubsidyForm.defaultProps = {
  subsidyValueInCents: 0,
  updateSubsidy: () => {},
  type: subsidyTypes.onlineOrders,
};

export default DeliverySubsidyForm;
