import React, {useEffect, useState} from "react";
import {Text, Flex, Box} from "rebass";
import {ToggleButton} from "../../../../index.js";

const styles = ({checked}) => {
  let styleObj = {
    textTransform: "capitalize",
    textAlign: "left",
    width: "100%",
    minHeight: "56px",
    fontFamily: "primary",
  };

  if (checked) {
    styleObj = {
      ...styleObj,
      color: "BLACK",
      borderWidth: "3px",
      borderColor: "CENT_BLUE",
    };
  }

  if (!checked) {
    styleObj = {
      ...styleObj,
      boxShadow:
        "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
      border: "none",
    };
  }
  return styleObj;
};

const OptionSelector = ({preference, onSelect}) => {
  const [selectionExist, setSelectionExist] = useState(false);

  useEffect(() => {
    setSelectionExist(
      preference.options.find(option => option.selected !== false) !== undefined
    );
  }, [preference]);

  return (
    <Flex flexDirection="column">
      <Flex alignItems="center">
        <Text sx={{textTransform: "capitalize"}} fontSize="18px" my="18px">
          {preference.fieldName}
        </Text>
        {preference.type === "multi" && (
          <Text fontSize="12px" pl="10px">
            (Select all that apply)
          </Text>
        )}
      </Flex>
      {preference.options.map(option => {
        return (
          <Box key={option.value} my="8px">
            <ToggleButton
              checked={option.selected}
              withRadio={preference.type === "single"}
              onClick={() => onSelect(option, preference)}
              sx={{
                ...styles({
                  checked: option.selected || (!selectionExist && option.isDefault),
                }),
              }}
              key={option.value}
            >
              {option.value}
            </ToggleButton>
          </Box>
        );
      })}
    </Flex>
  );
};

export default OptionSelector;
