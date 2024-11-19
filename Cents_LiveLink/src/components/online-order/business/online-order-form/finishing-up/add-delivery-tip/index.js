import React, {useState, useMemo} from "react";
import {Box, Flex, Text, Button, Image} from "rebass/styled-components";

// Assets & Styles
import {BlueCar, DoorDashIcon} from "../../../../../../assets/images";

// Components
import {DockModal, TextField} from "../../../../../common";

// Hooks
import useWindowSize from "../../../../../../hooks/useWindowSize";
import {onDemandDeliveryTypes} from "../../../../constants";

const AddOnDemandDeliveryTip = (props) => {
  const {
    isNewOrder,
    onAddDeliveryTip,
    deliveryTipFor,
    showDeliveryTipModal,
    setShowDeliveryTipModal,
  } = props;

  const tipOptions = [
    ...(deliveryTipFor === onDemandDeliveryTypes.pickupAndDelivery
      ? [
          {display: "$6", value: 6},
          {display: "$10", value: 10},
          {display: "$14", value: 14},
        ]
      : [
          {display: "$3", value: 3},
          {display: "$5", value: 5},
          {display: "$7", value: 7},
        ]),
    {display: "Other", value: 0},
  ];

  const [newDeliveryTipAmount, setNewDeliveryTipAmount] = useState(
    deliveryTipFor === onDemandDeliveryTypes.pickupAndDelivery ? 10 : 5
  );
  const [newDeliveryTipObject, setNewDeliveryTipObject] = useState(tipOptions[1]);
  const [width, height] = useWindowSize();
  const [showMainTipOptions, setShowMainTipOptions] = useState(true);
  const [showCustomTipOption, setShowCustomTipOption] = useState(false);
  const [header, setHeader] = useState();

  /**
   * Set the size according to current height
   */

  const getSize = useMemo(() => {
    if (height > 660 && width >= 400) {
      return 370;
    } else if (height <= 660 && width <= 360) {
      return 360;
    } else if (height > 660 && width >= 360) {
      return 390;
    } else {
      return 0.62 * height;
    }
  }, [width, height]);

  /**
   * Assign the incoming event object data to the newDeliveryTip state value
   *
   * @param {Object} tip
   */
  const handleDeliveryTipChange = (tip) => {
    setNewDeliveryTipAmount(tip.value);
    setNewDeliveryTipObject(tip);
    if (tip.display === "Other") {
      setHeader("Custom Tip");
      setShowCustomTipOption(true);
      setShowMainTipOptions(false);
    }
  };

  /**
   * Assign the incoming tip amount to the newDeliveryTipAmount
   *
   * @param {Number} event
   */
  const handleCustomTipAmountChange = (event) => {
    setNewDeliveryTipAmount(event.target.value);
  };

  const getHeaderLabel = () => {
    return deliveryTipFor === onDemandDeliveryTypes.pickupAndDelivery
      ? "On-Demand Pickup & Delivery"
      : deliveryTipFor === onDemandDeliveryTypes.pickup
      ? "On-Demand Pickup"
      : "On-Demand Delivery";
  };

  /**
   * Display the tip box selections
   */
  const renderTipPills = () => {
    return (
      <Flex {...styles.pillsContainer} py={width > 320 ? "10px" : ""}>
        <Flex flexDirection="row">
          {tipOptions.map((tip) => (
            <Flex
              key={tip.display}
              paddingRight={width < 320 ? "6px" : "12px"}
              flexDirection="row"
            >
              <Flex
                fontSize={width < 320 ? "12px" : "14px"}
                sx={{
                  ...styles.tipPillButton,
                  borderColor:
                    tip.display === newDeliveryTipObject.display ? "#3D98FF" : "#000000",
                  backgroundColor:
                    tip.display === newDeliveryTipObject.display ? "#3D98FF" : "#FFFFFF",
                  color:
                    tip.display === newDeliveryTipObject.display ? "#FFFFFF" : "#000000",
                }}
                onClick={() => {
                  handleDeliveryTipChange(tip);
                }}
              >
                <Text>{tip.display}</Text>
              </Flex>
            </Flex>
          ))}
        </Flex>

        <Text>${Number(newDeliveryTipAmount).toFixed(2)}</Text>
      </Flex>
    );
  };

  /**
   * Render the main tip selection screen
   */
  const renderMainTipScreen = () => {
    return (
      <>
        <Flex flexDirection="row ">
          <Text {...styles.pickupOption}>{getHeaderLabel()}</Text>
          <Image {...styles.doorDashLogo} src={DoorDashIcon} />
        </Flex>
        <Flex flexDirection="row" justifyContent="space-between">
          <Flex flexDirection="column" pr="6px" width="100%">
            <Text {...styles.tipHeader}>
              Tip your Driver
              {deliveryTipFor === onDemandDeliveryTypes.pickupAndDelivery ? "s" : ""}
            </Text>

            <Text {...styles.subtext}>
              We work with DoorDash to pick up and deliver your laundry on your schedule.
            </Text>
          </Flex>
          <Flex
            flexShrink="0"
            width={width < 320 ? "95px" : width >= 768 ? "308px" : "155px"}
          >
            <Flex width={width < 320 ? "95px" : "155px"} {...styles.imageContainer} />
          </Flex>
        </Flex>

        <Text {...styles.tipDisclaimer}>
          {deliveryTipFor === onDemandDeliveryTypes.pickupAndDelivery
            ? "This tip will be split evenly between both drivers."
            : "100% of this tip will go to your driver."}
        </Text>

        <Flex>{renderTipPills()}</Flex>
      </>
    );
  };

  /**
   * Render the custom tip option
   */
  const renderCustomTipScreen = () => {
    return (
      <Flex flexDirection="column" width="90%">
        <TextField
          prefix="$"
          label="Custom Tip Amount"
          type="number"
          materialWrapperStyle={{width: ["100%", "100%", "100%", "50%"]}}
          wrapperInputStyle={{fontSize: "1rem"}}
          value={newDeliveryTipAmount}
          onChange={handleCustomTipAmountChange}
        />
      </Flex>
    );
  };

  const renderTipModal = () => {
    return (
      <DockModal
        isOpen={showDeliveryTipModal}
        toggle={() => {
          setShowCustomTipOption(!showCustomTipOption);
          setShowMainTipOptions(true);
          setHeader(null);
        }}
        provideBackOption={showCustomTipOption}
        size={getSize}
        header={header}
        fixedSize
      >
        <Box height={showMainTipOptions ? "100%" : "80%"} {...styles.container}>
          {showMainTipOptions && renderMainTipScreen()}
          {showCustomTipOption && renderCustomTipScreen()}
          <Flex {...styles.footerContainer}>
            <Button
              {...styles.saveButton}
              onClick={() => {
                if (showCustomTipOption) {
                  setHeader(null);
                  setShowMainTipOptions(true);
                  setShowCustomTipOption(false);
                } else {
                  onAddDeliveryTip(newDeliveryTipAmount);
                  setShowDeliveryTipModal(!showDeliveryTipModal);
                }
              }}
            >
              {showMainTipOptions
                ? `${isNewOrder ? "ADD" : "UPDATE"} DRIVER TIP AND SUBMIT`
                : "CONTINUE"}
            </Button>
          </Flex>
        </Box>
      </DockModal>
    );
  };

  return <Box>{renderTipModal()}</Box>;
};

const styles = {
  container: {
    justifyContent: "space-between",
    flexDirection: "column",
    alignItems: "center",
    paddingLeft: "20px",
    py: "18px",
    position: "relative",
  },
  tipOptions: {
    width: "100%",
  },
  pickupOption: {
    sx: {
      alignItems: "center",
      justifyContent: "flex-start",
      color: "#3D98FF",
      fontSize: ["14px", "18px"],
    },
    py: "6px",
  },
  tipHeader: {
    sx: {
      alignItems: "center",
      justifyContent: "flex-start",
    },
    fontSize: ["20", "24px"],
    pt: "12px",
    pb: "18px",
  },
  subtext: {
    fontFamily: "secondary",
    fontSize: ["14px", "18px"],
  },
  saveButton: {
    sx: {
      backgroundColor: "#3D98FF",
      width: "100%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    p: "18px",
  },
  tipDisclaimer: {
    fontFamily: "secondary",
    fontSize: ["13px", "14px"],
    color: "#7B7B7B",
    pt: "18px",
    pb: "15px",
  },
  tipPillButton: {
    border: "solid",
    borderRadius: "5px",
    borderWidth: "1px",
    fontFamily: "secondary",
    px: "12px",
    py: "6px",
  },
  imageContainer: {
    sx: {
      width: ["100%", "100%", "100%", "100%"],
      position: "relative",
      overflow: "hidden",
      backgroundImage: `url(${BlueCar})`,
      backgroundSize: ["cover", "cover", "cover", "cover"],
      flexDirection: "column",
      top: "10px",
    },
    height: "100px",
    py: ["0px", "0px", "55px", "55px"],
    pr: ["0px", "0px", "0px", "20px"],
  },
  column: {
    float: "left",
    padding: "10px",
  },

  doorDashLogo: {
    verticalAlign: "middle",
  },

  pillsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    pr: "18px",
    width: "100%",
  },
  footerContainer: {
    py: "18px",
    pr: "18px",
  },
};

export default AddOnDemandDeliveryTip;
