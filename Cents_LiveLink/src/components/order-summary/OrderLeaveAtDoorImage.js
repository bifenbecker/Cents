import React from "react";
import {Flex, Image} from "rebass/styled-components";
import {DockModal} from "../common";
import useWindowSize from "../../hooks/useWindowSize";
import {useMemo} from "react";
import theme from "../../theme";

const OrderLeaveAtDoorImage = props => {
  const {isOpen, toggle, imageUrl} = props;
  const [height] = useWindowSize();

  const getSize = useMemo(() => {
    if (height >= 568) {
      return 250;
    } else {
      return 0.7 * height;
    }
  }, [height]);

  const handleBackClick = () => {
    toggle();
  };

  return (
    <DockModal
      header="Your order has been left at your door"
      isOpen={isOpen}
      toggle={toggle}
      size={getSize}
      fixedSize
      provideBackOption
      headerTextColor={theme.colors.primary}
      onBackClick={handleBackClick}
    >
      <Flex {...styles.deliveredImageContainer}>
        <Image
          src={imageUrl}
          style={styles.imageStyle}
          alt={"Image At The Door"}
          onClick={() => window.open(imageUrl, "_blank")}
        />
      </Flex>
    </DockModal>
  );
};

const styles = {
  mainWrapper: {
    sx: {
      height: "100%",
      flexDirection: "column",
    },
  },
  deliveredImageContainer: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
    },
    width: "100%",
  },
  imageStyle: {
    width: "120px",
  },
};
export default OrderLeaveAtDoorImage;
