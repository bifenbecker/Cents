import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Box} from "rebass/styled-components";

const SimplePopover = props => {
  const {
    isOpen,
    toggle,
    label,
    children,
    wrapperStyles,
    labelStyles,
    childrenStyles,
    beforeOpen,
  } = props;

  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    toggle(open);
  }, [open, toggle]);

  const close = () => setOpen(false);

  useEffect(() => {
    window.addEventListener("click", close);
    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  return (
    <Box
      {...styles.wrapper}
      {...wrapperStyles}
      sx={{...styles.wrapper.sx, ...wrapperStyles?.sx}}
    >
      <Box
        onClick={e => {
          e.stopPropagation();
          if (!open && beforeOpen) {
            beforeOpen();
          }
          setOpen(state => !state);
        }}
        {...styles.label}
        {...labelStyles}
        sx={{...styles.label.sx, ...labelStyles?.sx}}
      >
        {label}
      </Box>
      {open && (
        <Box
          {...styles.children}
          {...childrenStyles}
          sx={{...styles.children.sx, ...childrenStyles?.sx}}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

const styles = {
  wrapper: {
    sx: {
      position: "relative",
    },
  },
  label: {
    sx: {
      cursor: "pointer",
    },
  },
  children: {
    minWidth: "180px",
    sx: {
      right: 0,
      position: "absolute",
      boxShadow: "0 2px 6px 0 rgba(0,0,0,0.25)",
      borderRadius: "4px",
    },
  },
};

SimplePopover.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  label: PropTypes.any.isRequired,
  children: PropTypes.any.isRequired,
  wrapperStyles: PropTypes.object,
  labelStyles: PropTypes.object,
  childrenStyles: PropTypes.object,
  beforeOpen: PropTypes.func,
};

SimplePopover.defaultProps = {
  wrapperStyles: {},
  labelStyles: {},
  childrenStyles: {},
};

export default SimplePopover;
