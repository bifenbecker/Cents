import React, {useState} from "react";
import "./_recurring-discount.scss";
import Radio from "../../../../../../commons/radio/radio";
import PercentInput from "../../../../../../commons/percent-input/percent-input";

const RecurringDiscount = (props) => {
  const {
    recurringDiscountInPercent,
    setRecurringDiscountInPercent,
    hasRecurringDiscount,
    setHasRecurringDiscount,
    error,
    setError,
  } = props;

  const handleChange = (percent) => {
    if (Number(percent) === 0 && percent?.length !== 0) {
      setError("Percentage value should be greater than zero");
    } else {
      setError("");
    }
    setRecurringDiscountInPercent(percent);
  };

  const handleNoDiscount = () => {
    setError("");
    setRecurringDiscountInPercent(0);
    setHasRecurringDiscount(false);
  };

  return (
    <div className="recurring-discount__discountWrapper">
      <div className="recurring-discount__title">
        <h6 className="recurring-discount__header">
          Would you like to set a discount that will apply <br />
          to all recurring pickup/delivery orders?
        </h6>
        <small>Recurring discount does not apply to commercial customers</small>
      </div>
      <div className="recurring-discount__container">
        <div className="recurring-discount__dropdown-container">
          <div className="recurring-discount__radio-container">
            <Radio selected={!hasRecurringDiscount} onChange={handleNoDiscount} />
            <span>No discount</span>
          </div>
          <div className="recurring-discount__radio-container">
            <Radio
              selected={hasRecurringDiscount}
              onChange={() => {
                setHasRecurringDiscount(true);
              }}
            />
            <span> Apply a percentage discount</span>
          </div>
          <div className="recurring-discount__inputfield">
            {hasRecurringDiscount ? (
              <PercentInput
                label={"Discount %"}
                value={recurringDiscountInPercent}
                onPercentChange={handleChange}
                error={error}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringDiscount;
