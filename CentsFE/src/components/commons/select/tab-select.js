import React, {useState} from "react";
import {components} from "react-select";
import {PropTypes} from "prop-types";
import Select from "./select";

const TabSelect = (props) => {
  const [selectedGroup, setSelectedGroup] = useState(
    props?.options[0]?.label?.toLowerCase() || props?.selectedLabel?.toLowerCase()
  );
  const selectGroup = (e, groupIndex) => setSelectedGroup(groupIndex);

  const Menu = ({children, ...props}) => {
    const menuOptionsCount = props.selectProps.options.length;
    return (
      <components.Menu {...props}>
        <div className="dropdown-tab-container">
          {props.selectProps.options.map((option, index) => (
            <div
              onClick={(e) =>
                selectGroup(e, props.selectProps.getOptionLabel(option).toLowerCase())
              }
              className={`dropdown-tab-container__tab ${
                selectedGroup === props.selectProps.getOptionLabel(option).toLowerCase()
                  ? "active"
                  : null
              }`}
              key={index}
            >
              {props.selectProps.getOptionLabel(option)}
            </div>
          ))}
        </div>
        {children}
      </components.Menu>
    );
  };

  const MenuList = ({children, ...props}) => {
    const filteredChildren = React.Children.toArray(children).filter((group, index) => {
      if (
        group.type.name === "NoOptionsMessage" ||
        (group.props.data && group.props.data.label.toLowerCase() === selectedGroup)
      )
        return true;
      return false;
    });

    return <components.MenuList {...props}>{filteredChildren}</components.MenuList>;
  };

  return (
    <Select
      className="dropdown-tab-select"
      {...props}
      formatGroupLabel={() => null}
      label={props?.placeholder}
      components={{
        Menu,
        MenuList,
      }}
    />
  );
};

TabSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          value: PropTypes.any,
        })
      ),
    })
  ).isRequired,
  defaultValue: PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.any,
  }),
  onChange: PropTypes.func,
  formatGroupLabel: PropTypes.func,
  formatOptionLabel: PropTypes.func,
  label: PropTypes.string,
  maxMenuHeight: PropTypes.number,
  smallHeight: PropTypes.bool,
  menuShouldScrollIntoView: PropTypes.bool,
  selectedLabel: PropTypes.string,
  placeholder: PropTypes.string,
};

export default TabSelect;
