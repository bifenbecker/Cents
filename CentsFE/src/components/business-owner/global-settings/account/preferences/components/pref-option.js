import React, {useEffect, useState} from "react";
import TextField from "../../../../../commons/textField/textField.js";
import DeleteCta from "./delete-cta.js";
import {PREFERENCES_OPTION_LENGTH} from "../../../../../../constants/index.js";

const PrefOption = ({
  showDefault,
  data,
  pos,
  onUpdate,
  onMakeDefault,
  onClickRemove,
  isLast,
  autoFocus,
  sectionData,
  setValid,
}) => {
  const [preferenceOption, setPreferenceOption] = useState(data);
  const [fieldValue, setFieldValue] = useState(data.value);
  const [isHovered, setIsHovered] = useState(false);
  const [textfieldSize, setTextfieldSize] = useState(
    preferenceOption.value.length > 3 ? preferenceOption.value.length : 5
  );
  const fieldRef = React.createRef();

  const handleKeyPressEnter = (event) => {
    if (event.key === "Enter") {
      event.target.blur();
    }
  };

  const handleSingleOptionOrNewSectionOptionsUpdate = (singleOptionAdded) => {
    if (singleOptionAdded && fieldValue.trim() !== "") {
      onUpdate({...preferenceOption, value: fieldValue}, pos - 1);
    } else if (!singleOptionAdded) {
      onUpdate({...preferenceOption, value: fieldValue}, pos - 1);
    }
  };

  const savePreferenceOption = () => {
    const singleOptionAdded = sectionData === undefined ? true : false;
    if (fieldValue !== preferenceOption.value) {
      handleSingleOptionOrNewSectionOptionsUpdate(singleOptionAdded);
    }
  };

  const handleIfFieldValueIsValid = (isValid, value) => {
    if (!isValid || !value.trim()) {
      setValid(false);
    } else if (isValid && value.trim()) {
      setValid(true);
    }
  };

  const updateValue = ({target: {value}}) => {
    const isValid = sectionData?.options?.every((optionObj) => optionObj?.value?.trim());

    if (isValid !== undefined) {
      handleIfFieldValueIsValid(isValid, value);
    }
    // setPreferenceOption({...preferenceOption, value});
    if (value.length < PREFERENCES_OPTION_LENGTH) {
      setFieldValue(value);
    }
  };

  useEffect(() => {
    if (autoFocus && fieldRef.current) {
      fieldRef.current.focus();
    }
  }, [autoFocus, fieldRef]);

  useEffect(() => {
    const newTextFieldSize =
      preferenceOption.value.length > 3 ? preferenceOption.value.length : 5;
    setTextfieldSize(newTextFieldSize);
  }, [preferenceOption]);

  useEffect(() => {
    setPreferenceOption(data);
  }, [data]);

  const handleOnClickDefault = () => {
    onMakeDefault(preferenceOption, pos - 1);
  };

  return (
    <div
      className="option-container"
      onMouseLeave={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
    >
      <TextField
        label={`Option ${pos}`}
        className="account-settings-input"
        value={fieldValue?.toLowerCase() || ""}
        onChange={updateValue}
        onKeyPress={handleKeyPressEnter}
        onBlur={savePreferenceOption}
        isInline={true}
        size={textfieldSize}
        ref={fieldRef}
      />
      {!isLast && <DeleteCta onClick={onClickRemove} />}

      {isHovered && showDefault && !preferenceOption.isDefault && !isLast && (
        <button
          onClick={handleOnClickDefault}
          className="btn btn-text-only btn-make-default"
        >
          Make default
        </button>
      )}
      {preferenceOption.isDefault && showDefault && (
        <span className="info-flag">Default</span>
      )}
    </div>
  );
};

export default PrefOption;
