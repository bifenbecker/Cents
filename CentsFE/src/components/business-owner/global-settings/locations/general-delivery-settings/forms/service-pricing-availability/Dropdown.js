import React from "react";
import TabSelect from "../../../../../../commons/select/tab-select";

const formatOptionLabel = ({value, label, metaInfo}) => (
  <div className="dropdown-option">
    <div className="dropdown-option__label">{label}</div>
    <span className="dropdown-option__meta-info">{metaInfo}</span>
  </div>
);

const Dropdown = ({options, onChange, defaultValue, placeholder}) => {
  return (
    <div className="dropdown-wrapper">
      <TabSelect
        smallHeight
        maxMenuHeight={180}
        menuShouldScrollIntoView={true}
        hideSelectedOptions
        options={options}
        defaultValue={defaultValue}
        formatGroupLabel={() => null /*don't show the label in list*/}
        formatOptionLabel={formatOptionLabel}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Dropdown;
