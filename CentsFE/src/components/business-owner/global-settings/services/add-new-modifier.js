import React, {useState} from "react";
import exitIcon from "../../../../assets/images/Icon_Exit_Side_Panel.svg";
import TextField from "../../../commons/textField/textField";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import dollarIcon from "../../../../assets/images/Icon_Price_Side_Panel.svg";
import modifierIcon from "../../../../assets/images/Icon_Modifier.svg";

const AddNewModifier = (props) => {
  const [modifierDetails, setModifierDetails] = useState({
    name: props.isUpdate ? props.updateModifierValues.name : "",
    price: props.isUpdate ? props.updateModifierValues.price : "",
  });

  const handleCreateOrUpdateModifier = () => {
    const requestPayload = {
      name: modifierDetails.name,
      price: Number(modifierDetails.price),
    };
    if (props.isUpdate) {
      requestPayload.modifierId = props.updateModifierValues.modifierId;
    }
    props.createOrUpdateModifier(requestPayload, props.isUpdate);
  };

  return (
    <div className="issue-credit-container">
      <main className="issue-credit-form-container">
        <div className="exit-icon-container">
          <img
            src={exitIcon}
            alt=""
            onClick={() => {
              props.showHideAddModifierScreen(false);
            }}
          />
        </div>
        <p>{props.isUpdate ? "Update Modifier" : "Add New Modifier"}</p>
        <div className="form-field-container">
          <img src={modifierIcon} alt="icon" />
          <TextField
            label="Modifier Name"
            className="no-prefix"
            value={modifierDetails.name}
            onChange={({target: {value: name}}) => {
              setModifierDetails((prevState) => ({...prevState, name}));
            }}
          />
        </div>
        <div className="form-field-container">
          <img src={dollarIcon} alt="icon" />
          <TextField
            label="Price"
            prefix="$"
            suffix="/lb"
            className="label-prefix"
            value={modifierDetails.price}
            onChange={({target: {value: price}}) => {
              setModifierDetails((prevState) => ({
                ...prevState,
                price: price.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"),
              }));
            }}
            onBlur={({target: {value: price}}) => {
              setModifierDetails((prevState) => ({
                ...prevState,
                price: Number(price).toFixed(2),
              }));
            }}
            maxLength={6}
          />
        </div>
      </main>
      <footer className={`service-prices-footer`}>
        <p className="service-footer-error-message new-service">
          {props.createModifierError || null}
        </p>
        <button
          className="btn btn-text-only cancel-button"
          onClick={() => {
            props.showHideAddModifierScreen(false);
          }}
        >
          Cancel
        </button>
        <button
          className="btn-theme btn-rounded form-save-button"
          onClick={handleCreateOrUpdateModifier}
          disabled={!modifierDetails.price || !modifierDetails.name}
        >
          {props.isUpdate ? "UPDATE" : "SAVE"}
        </button>
      </footer>
      {props.createModifierCallInProgress ? <BlockingLoader /> : null}
    </div>
  );
};

export default AddNewModifier;
