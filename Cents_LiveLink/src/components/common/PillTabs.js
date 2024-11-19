import React from "react";
import PropTypes from "prop-types";
import {Box, Flex, Text} from "rebass/styled-components";

const PillTabs = props => {
  const {tabs, currentTabId, onTabChange, wrapperStyle} = props;

  return (
    <Flex
      {...styles.wrapper}
      {...wrapperStyle}
      sx={{...styles.wrapper.sx, ...wrapperStyle?.sx}}
    >
      {tabs.map((tab, index) => (
        <Flex
          key={tab.id}
          {...styles.tab.defaults}
          {...styles.tab[tab.id === currentTabId ? "selected" : "unSelected"]}
          {...(index === 0 ? styles.tab.first : {})}
          {...(index === tabs.length - 1 ? styles.tab.last : {})}
          onClick={() => onTabChange(tab)}
        >
          <Box {...styles.text.wrapper}>
            <Text>{tab.title}</Text>
            <Text {...styles.text.subtext}>{tab.subtext}</Text>
          </Box>
        </Flex>
      ))}
    </Flex>
  );
};

const styles = {
  wrapper: {
    bg: "WHITE",
    height: "56px",
    width: "100%",
    sx: {
      borderRadius: "26.88px",
      boxShadow: "0 2px 6px 0 rgba(0,0,0,0.2)",
    },
  },
  tab: {
    defaults: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      sx: {
        cursor: "pointer",
        border: 0,
      },
    },
    selected: {
      color: "WHITE",
      bg: "primary",
    },
    unSelected: {
      color: "BLACK",
      bg: "WHITE",
    },
    first: {
      sx: {
        cursor: "pointer",
        borderRadius: "26.88px 0 0 26.88px",
      },
    },
    last: {
      sx: {
        cursor: "pointer",
        borderRadius: "0 26.88px 26.88px 0",
      },
    },
  },
  text: {
    wrapper: {
      textAlign: "center",
    },
    subtext: {
      fontFamily: "secondary",
      fontSize: "12px",
    },
  },
};

PillTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentTabId: PropTypes.any,
  onTabChange: PropTypes.func.isRequired,
  wrapperStyle: PropTypes.object,
};

PillTabs.defaultProps = {
  wrapperStyle: {},
  currentTabId: undefined,
};

export default PillTabs;
