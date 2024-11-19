import React, {useEffect, useState} from "react";
import {Flex, Text, Image, Box} from "rebass/styled-components";
import {useTheme} from "@material-ui/core/styles";
import PropTypes from "prop-types";

import {DownArrow} from "../../assets/images";

const Dropdown = (props) => {
  const {list, selectedListItem, onListItemClick} = props;
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selectedListItemDisplay = list.find(
    (item) => item.value === selectedListItem
  )?.label;

  const close = () => setOpen(false);

  useEffect(() => {
    window.addEventListener("click", close);
    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  return (
    <Box {...styles.wrapper}>
      <Flex
        {...styles.mainWrapper}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((state) => !state);
        }}
      >
        <Text {...styles.normalText}>{selectedListItemDisplay}</Text>
        <Image src={DownArrow} />
      </Flex>
      {open && list.length && (
        <Box {...styles.children}>
          {list.map((item, index) => (
            <Text
              {...(selectedListItem === item.value
                ? {
                    ...styles.selectedChildrenItem,
                    bg: theme?.palette?.primary?.main
                      ? `${theme?.palette?.primary?.main}1a`
                      : "#E9F1FB",
                  }
                : styles.childrenItem)}
              {...styles.normalText}
              key={index}
              onClick={() => onListItemClick(item)}
            >
              {item.label}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

const styles = {
  wrapper: {
    flexDirection: "column",
    width: "100%",
  },
  mainWrapper: {
    width: "180px",
    flexDirection: "row",
    justifyContent: "space-between",
    pb: "4px",
    sx: {borderBottom: "1px solid black"},
  },
  normalText: {
    fontSize: "16px",
    color: "BLACK",
    fontFamily: "secondary",
    paddingRight: "3px",
  },
  children: {
    minWidth: "180px",
    marginLeft: "20px",
    padding: "5px 0px",
    bg: "WHITE",
    sx: {
      left: 0,
      position: "absolute",
      boxShadow: "0 2px 6px 0 rgba(0,0,0,0.25)",
      borderRadius: "4px",
    },
  },
  childrenItem: {
    padding: "10px",
    cursor: "default",
  },
  selectedChildrenItem: {
    padding: "10px",
    bg: "#E9F1FB",
    cursor: "default",
  },
};

Dropdown.propTypes = {
  list: PropTypes.array.isRequired,
  selectedListItem: PropTypes.any.isRequired,
  onListItemClick: PropTypes.any.isRequired,
};

export default Dropdown;
