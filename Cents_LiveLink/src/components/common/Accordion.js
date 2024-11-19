import React, {useRef} from "react";
import {Box} from "rebass/styled-components";
import PropTypes from "prop-types";

import useToggle from "../../hooks/useToggle";

const Accordian = props => {
  const {label, children, labelStyles} = props;
  const childrenRef = useRef();

  const {isOpen, toggle} = useToggle();

  return (
    <>
      <Box onClick={toggle} {...labelStyles}>
        {isOpen ? "-" : "+"}
        &nbsp;
        {label}
      </Box>
      <Box
        {...styles.childrenWrapper}
        display={isOpen ? "block" : "hidden"}
        height={isOpen ? childrenRef.current.scrollHeight : 0}
        ref={childrenRef}
      >
        {children}
      </Box>
    </>
  );
};

const styles = {
  childrenWrapper: {
    height: 0,
    sx: {
      overflow: "hidden",
      transition: "all 0.3s ease-in-out",
    },
  },
};

Accordian.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  children: PropTypes.node.isRequired,
  labelStyles: PropTypes.object,
};

Accordian.defaultProps = {
  labelStyles: {},
};

export default Accordian;
