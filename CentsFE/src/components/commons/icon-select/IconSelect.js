import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useState} from "react";
import ReactSelect from "react-select";

const IconSelect = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const {className, icon} = props;

  const remainingProps = {...props, icon: undefined, className: undefined};

  return (
    <div
      className={`icon-select ${className} ${isOpen ? "open" : ""} ${
        props.isDisabled ? "disabled" : ""
      }`}
    >
      {icon && <img className={"icon"} alt={"icon"} src={icon} />}
      <ReactSelect
        {...remainingProps}
        className={"icon-select-react-select"}
        classNamePrefix={"icon-select"}
        menuIsOpen={isOpen}
        onMenuOpen={() => setIsOpen(true)}
        onMenuClose={() => setIsOpen(false)}
      />
      <p className="custom-indicator" onClick={() => setIsOpen((isOpen) => !isOpen)}>
        <FontAwesomeIcon icon={faChevronRight} className="right-icon" />
      </p>
    </div>
  );
};

export default IconSelect;
