import React, {useEffect, useState} from "react";
import PrefOption from "./pref-option.js";
import TextField from "../../../../../commons/textField/textField.js";
import DeleteCta from "./delete-cta.js";
import IconSelect from "../../../../../commons/icon-select/IconSelect.js";
import _ from "lodash";
import {PREFERENCES_SECTION_TITLE_LENGTH} from "../../../../../../constants/index.js";

const sectionTypes = [
  {value: "single", label: "Single selection", selected: true},
  {value: "multi", label: "Multi selection"},
];

const ConfigSection = ({
  allowRemove,
  data: section,
  title,
  onRemoveSection,
  onUpdateSection,
  onAddNewOption,
  onUpdateOptions,
  onRemoveOption,
  onChangeDefaultOption,
  isNew,
  autoFocus,
  sectionData,
  setValid,
}) => {
  const [showNewOptionField, setShowNewOptionField] = useState(false);
  const [fieldName, setFieldName] = useState(section.fieldName);
  const [sectionType] = useState(section.type);
  const fieldNameRef = React.createRef();

  useEffect(() => {
    if (
      autoFocus &&
      fieldNameRef.current &&
      !showNewOptionField &&
      section.options.length === 0
    ) {
      fieldNameRef.current.focus();
    }
  }, [autoFocus, fieldNameRef, section.options.length, showNewOptionField]);

  const handleMakeDefaultOption = (selectedOption, index = null) => {
    const options = _.cloneDeep(section.options);
    const currentDefaultOption = options.find((option) => option.isDefault) || options[0];

    let optionIndex = index;
    if (selectedOption.hasOwnProperty("id")) {
      optionIndex = options.findIndex((option) => option.id === selectedOption.id);
    }

    if (optionIndex > -1 && optionIndex !== null) {
      currentDefaultOption.isDefault = false;
      options[optionIndex].isDefault = true;

      if (isNew) {
        onUpdateSection({...section, options});
      } else {
        onChangeDefaultOption(currentDefaultOption, options[optionIndex]);
      }
    }
  };

  const handleRemoveOption = (optionToRemove, index = null) => {
    if (section.options.length > 1) {
      const options = _.cloneDeep(section.options);

      let optionIndex = index;
      if (optionToRemove.hasOwnProperty("id")) {
        optionIndex = options.findIndex((option) => option.id === optionToRemove.id);
      }

      if (optionIndex > -1 && optionIndex !== null) {
        if (isNew) {
          options.splice(optionIndex, 1);

          if (
            options.length > 0 &&
            (optionToRemove.isDefault === true || options.length === 1)
          ) {
            options[0].isDefault = true;
          }

          onUpdateSection({...section, options});
        } else {
          onRemoveOption(options[optionIndex]);
        }
      }
    }
  };

  const updateSingleOptionOrNewSectionWithOptions = (
    options,
    updatedOption,
    optionIndex
  ) => {
    if (isNew) {
      options[optionIndex] = updatedOption;
      onUpdateSection({...section, options});
    } else {
      onUpdateOptions(updatedOption);
    }
  };

  const handleUpdateOptions = (updatedOption, index = null) => {
    const options = _.cloneDeep(section.options);

    let optionIndex = index;
    if (updatedOption.hasOwnProperty("id")) {
      optionIndex = options.findIndex((option) => option.id === updatedOption.id);
    }

    if (optionIndex > -1 && optionIndex !== null) {
      updateSingleOptionOrNewSectionWithOptions(options, updatedOption, optionIndex);
    }
  };

  const handleSectionNameChange = ({target: {value}}) => {
    if (value.length < PREFERENCES_SECTION_TITLE_LENGTH) {
      setFieldName(value);
    }
  };

  const handleSectionNameBlur = () => {
    if (section.options.length > 0 || isNew) {
      onUpdateSection({...section, fieldName});
    }
  };

  const handleKeyPressEnter = (event) => {
    if (event.key === "Enter") {
      event.target.blur();
    }
  };

  const handleUpdateSectionType = (newType) => {
    onUpdateSection({...section, type: newType.value});
  };

  const addNewOption = (option) => {
    onAddNewOption(option);
    setShowNewOptionField(false);
  };

  const optionValueSort = (option1, option2) => {
    return option1.value.localeCompare(option2.value);
  };

  const renderOptions = () => {
    return section.options
      .sort(optionValueSort)
      .map((option, index, options) => (
        <PrefOption
          onClickRemove={() => handleRemoveOption(option, index)}
          isLast={options.length === 1}
          onMakeDefault={handleMakeDefaultOption}
          data={option}
          pos={index + 1}
          key={isNew ? option.value + index : option.id}
          onUpdate={handleUpdateOptions}
          showDefault={section.type === "single"}
          sectionData={sectionData}
          setValid={setValid}
        />
      ));
  };

  return (
    <div className="config-section-container">
      <div className="config-section-head-container">
        <TextField
          label={title}
          className="account-settings-input"
          value={fieldName}
          ref={fieldNameRef}
          onChange={handleSectionNameChange}
          onBlur={handleSectionNameBlur}
          onKeyPress={handleKeyPressEnter}
          isInline={true}
        />
        {allowRemove && <DeleteCta onClick={() => onRemoveSection(section)} />}
        <IconSelect
          isSearchable={false}
          className="config-section-select"
          options={sectionTypes}
          onChange={handleUpdateSectionType}
          defaultValue={sectionTypes.find((type) => type.value === sectionType)}
        />
      </div>
      <div className="options-list-container">
        {renderOptions()}
        {showNewOptionField && (
          <PrefOption
            pos={section.options.length + 1}
            data={{isDefault: section.options.length === 0, value: ""}}
            onUpdate={addNewOption}
            onClickRemove={() => setShowNewOptionField(false)}
            autoFocus={true}
            sectionData={sectionData}
            setValid={setValid}
          />
        )}
        <div className="add-new-button" onClick={() => setShowNewOptionField(true)}>
          <p>
            <span>+</span> Add another option
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigSection;
