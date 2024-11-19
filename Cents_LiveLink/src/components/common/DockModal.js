import React, {useEffect, useMemo} from "react";
import PropTypes from "prop-types";
import Dock from "react-dock";
import {Flex, Image} from "rebass/styled-components";

import {IconBack, ExitIcon} from "../../assets/images";

import useWindowSize from "../../hooks/useWindowSize";

import Loader from "./loader";
import {Close} from "@material-ui/icons";
import {Grid, IconButton, Typography} from "@material-ui/core";

const DockModal = (props) => {
  const {
    isOpen,
    toggle,
    header,
    loading,
    children,
    provideBackOption,
    size,
    fixedSize,
    showExitIcon,
    onBackClick,
    headerTextColor,
    zIndex,
    closeOnOutsideClick,
    fullWidth,
    dockStyle,
  } = props;

  const [width] = useWindowSize();

  useEffect(() => {
    // stops the bg scroll when the dock is open
    document.querySelector("body").style.overflow = isOpen ? "hidden" : "visible";
  }, [isOpen]);

  const getWidth = useMemo(() => {
    if (width < 550 || fullWidth) {
      return "100%";
    } else if (width < 950) {
      return "75%";
    } else {
      return "50%";
    }
  }, [width]);

  const getLeft = useMemo(() => {
    if (width < 550 || fullWidth) {
      return "0";
    } else if (width < 950) {
      return "12.5%";
    } else {
      return "25%";
    }
  }, [width]);

  return (
    <Dock
      fluid={!fixedSize}
      size={width < 550 || fullWidth ? size : fixedSize ? window.innerHeight : 1}
      position="bottom"
      dockStyle={{width: getWidth, left: getLeft, zIndex, ...dockStyle}}
      dimStyle={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: width < 550 || fullWidth ? "none" : "white",
      }}
      isVisible={isOpen}
      onVisibleChange={provideBackOption || closeOnOutsideClick ? toggle : null}
    >
      {loading && <Loader style={{height: "100%"}} />}
      {(header || provideBackOption) && (
        <Flex {...styles.header.wrapper}>
          <div className="close-container">
            {provideBackOption &&
              (showExitIcon ? (
                <IconButton>
                  <Close
                    fontSize="large"
                    onClick={onBackClick ? onBackClick : toggle}
                    alt="Dock Close"
                  />
                </IconButton>
              ) : (
                <Image
                  src={showExitIcon ? ExitIcon : IconBack}
                  {...styles.header.image}
                  onClick={onBackClick ? onBackClick : toggle}
                  alt="Dock Close"
                />
              ))}
          </div>

          {header && (
            <Grid className="title">
              <Typography variant="h1" component="h2" color={headerTextColor}>
                {header}
              </Typography>
            </Grid>
            // <Text {...styles.header.text} color={headerTextColor}>
            //   {header}
            // </Text>
          )}
        </Flex>
      )}
      {/* Render children only when the dock modal is open */}
      {isOpen ? children : null}
    </Dock>
  );
};

const styles = {
  header: {
    wrapper: {
      height: "90px",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      sx: {
        position: "relative",
      },
    },
    text: {
      fontSize: "18px",
    },
    image: {
      sx: {
        position: "absolute",
        top: "18px",
        left: "18px",
      },
    },
  },
};

DockModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func,
  header: PropTypes.string,
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  provideBackOption: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  size: PropTypes.number,
  fixedSize: PropTypes.bool,
  onBackClick: PropTypes.func,
  zIndex: PropTypes.number,
  fullWidth: PropTypes.bool,
};

DockModal.defaultProps = {
  loading: false,
  provideBackOption: true,
  size: 0.75,
  fixedSize: false,
  showExitIcon: false,
  headerTextColor: "black",
  zIndex: 1,
  closeOnOutsideClick: false,
  fullWidth: false,
};

export default DockModal;
