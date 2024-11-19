import React, {useState} from "react";
import "./_custom-message.scss";
import TextField from "../../../../../../commons/textField/textField.js";
import TextArea from "../../../../../../commons/text-area/text-area.js";

const CustomMessage = (props) => {
  const {customHeader, setCustomHeader, customMessage, setCustomMessage} = props;

  const onCustomHeaderChange = (event) => {
    setCustomHeader(event?.target?.value);
  };
  const onCustomMessageChange = (event) => {
    setCustomMessage(event?.target?.value);
  };

  return (
    <div className="custom-message__wrapper">
      <div className="custom-message__title">
        <h6 className="custom-message__header">Custom Message for Customers</h6>
        <p>
          Customize the memo that the customer will see while placing an online pickup &
          delivery order.
        </p>
      </div>
      <div className="custom-message__container">
        <TextField
          label={"Custom Header"}
          onChange={onCustomHeaderChange}
          value={customHeader}
          maxLength="30"
        />
      </div>
      <div className="custom-message__container">
        <TextArea
          label={"Custom Message"}
          onChange={onCustomMessageChange}
          value={customMessage}
          maxLength="300"
          className={"custom-message-text-area"}
        />
      </div>
    </div>
  );
};

export default CustomMessage;
