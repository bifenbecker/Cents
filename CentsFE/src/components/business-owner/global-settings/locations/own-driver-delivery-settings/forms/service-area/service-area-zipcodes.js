import React from "react";
import PillWithCross from "../../../../../../commons/pill-button/pill-with-cross";
import TextField from "../../../../../../commons/textField/textField";

import routeIcon from "../../../../../../../assets/images/Icon_Zip_Codes.svg";
import addIcon from "../../../../../../../assets/images/Icon_Add_New_Zipcode.svg";

const ServiceAreaZipcodes = ({
  value,
  onClick,
  onClose,
  hasZones,
  onChange,
  className,
  zipCodeList,
}) => {
  return (
    <>
      <div className={className}>
        <img src={routeIcon} alt="Route" />
        <TextField
          label="Enter zip code"
          className="zip-code-input"
          onChange={onChange}
          value={value}
        />
        <img src={addIcon} alt="Add new" className="add-new-zip-icon" onClick={onClick} />
      </div>
      {zipCodeList ? (
        <div className={hasZones ? "zone-wise-zip-container" : "zip-list-container"}>
          {zipCodeList.map((item, index) => (
            <PillWithCross
              key={index}
              className="deselected-pill pill-with-cross-container"
              onClose={() => onClose(item, index)}
            >
              {item}
            </PillWithCross>
          ))}
        </div>
      ) : null}
    </>
  );
};

export default ServiceAreaZipcodes;
