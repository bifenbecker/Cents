import React, {useMemo} from "react";
import useWindowSize from "../../../hooks/useWindowSize";
import {DockModal} from "..";
import {Text, Flex, Button} from "rebass/styled-components";

const CADriverFeeInfoPopup = ({isOpen, close}) => {
  const [width, height] = useWindowSize();

  const getSize = useMemo(() => {
    if (height >= 568) {
      return 315;
    } else {
      return 0.75 * height;
    }
  }, [height]);

  const fontSize = width < 300 ? "14px" : width <= 340 ? "16px" : "18px";

  return (
    <DockModal isOpen={isOpen} provideBackOption={false} fixedSize size={getSize}>
      <Flex {...styles.mainWrapper}>
        <Flex {...styles.textContent}>
          <Text {...styles.boldText} fontSize={fontSize}>
            What is the CA Driver Fee?
          </Text>
          <Text {...styles.normalText}>
            Our on-demand delivery partner charges an additional fee each way for pickup
            and delivery in California. This fee helps cover benefits like health
            insurance and guaranteed earnings for on-demand pickup and delivery drivers.
          </Text>
          <Flex {...styles.footerWrapper}>
            <Button {...styles.closeButton} onClick={close}>
              Close
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </DockModal>
  );
};

const styles = {
  mainWrapper: {
    sx: {
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    padding: "20px",
  },
  textContent: {
    flexDirection: "column",
    sx: {
      flex: 2,
    },
  },
  boldText: {
    color: "BLACK",
    fontWeight: 700,
    lineHeight: "21px",
  },
  normalText: {
    fontSize: "18px",
    color: "BLACK",
    fontFamily: "secondary",
    mt: "15px",
  },
  footerWrapper: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "120px",
    },
  },
  closeButton: {
    sx: {
      backgroundColor: "CENTS_BLUE",
      width: "100%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    p: "20px",
  },
};

export default CADriverFeeInfoPopup;
