import React, {useState, useMemo} from "react";
import PropTypes from "prop-types";
import {Flex, Text, Button} from "rebass/styled-components";

import useWindowSize from "../../hooks/useWindowSize";
import {orderChoices, orderChoicesDisplay} from "../../constants/order";

import {DockModal} from "./.";

const CurrentOrAllRecurringOrdersChoice = props => {
  const [, height] = useWindowSize();
  const {isOpen, toggle, dockProps, header, onSubmit} = props;

  const [selectedChoice, setSelectedChoice] = useState(orderChoices.currentOrder);

  const getSize = useMemo(() => {
    if (height >= 568) {
      return 364;
    } else {
      return 0.75 * height;
    }
  }, [height]);

  const closeModal = () => {
    setSelectedChoice(orderChoices.currentOrder);
    toggle();
  };

  const selectChoice = e => {
    setSelectedChoice(e.target.id);
  };

  const handleSubmitClick = () => {
    onSubmit(selectedChoice);
  };

  return (
    <DockModal
      {...dockProps}
      header={header}
      isOpen={isOpen}
      toggle={closeModal}
      size={getSize}
      fixedSize
      showExitIcon
      zIndex={10}
    >
      <>
        <Flex onClick={selectChoice} {...styles.wrapper}>
          {Object.values(orderChoices).map(choice => (
            <Text
              id={choice}
              sx={{
                ...styles.text,
                bg: selectedChoice === choice ? "BACKGROUND_LIGHT_BLUE" : "",
              }}
              key={choice}
            >
              {orderChoicesDisplay[choice]}
            </Text>
          ))}
        </Flex>
        <Flex {...styles.saveButtonContainer}>
          <Button {...styles.saveButton} onClick={handleSubmitClick}>
            Ok
          </Button>
        </Flex>
      </>
    </DockModal>
  );
};

const styles = {
  wrapper: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  text: {
    paddingLeft: "37px",
    py: "33px",
  },
  saveButtonContainer: {
    sx: {
      margin: "0",
      minWidth: "0",
      position: "relative",
      width: "100%",
      bottom: 0,
      left: 0,
      marginTop: "auto",
      boxShadow: "0 -5px 8px -7px rgba(0,0,0,0.2)",
      bg: "WHITE",
    },
  },
  saveButton: {
    sx: {
      backgroundColor: "#3D98FF",
      width: "100%",
      borderRadius: 31,
      textTransform: "uppercase",
      marginLeft: "18px",
      marginRight: "18px",
      boxShadow: "0px 5px 25px rgba(121, 120, 120, 0.248907)",
    },
    my: 34,
    py: 20,
  },
};

CurrentOrAllRecurringOrdersChoice.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  dockProps: PropTypes.object,
  header: PropTypes.string.isRequired,
};

CurrentOrAllRecurringOrdersChoice.defaultProps = {
  dockProps: {},
};

export default CurrentOrAllRecurringOrdersChoice;
