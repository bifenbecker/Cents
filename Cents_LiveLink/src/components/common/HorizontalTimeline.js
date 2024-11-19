import React from "react";
import {Box, Flex, Image} from "rebass/styled-components";

// Assets
import {
  DeliveryTrackingStatusCompleteIcon,
  OrderCanceledX,
  OrderCompleteTick,
} from "../../assets/images";
import {timelineCircleDimensions} from "../../utils/theme";

const HorizontalTimeline = ({totalStagesArray, isCanceled}) => {
  return (
    <Flex {...styles.timelineContainer} width={isCanceled ? "50%" : "auto"}>
      {totalStagesArray.map((item, index) => (
        <React.Fragment key={`${index}-timeline`}>
          {item.isOrderCanceled ? (
            <Image src={OrderCanceledX} />
          ) : item.isOrderComplete ? (
            <Image src={OrderCompleteTick} {...styles.completeOval} />
          ) : item.isStepComplete ? (
            <Image src={DeliveryTrackingStatusCompleteIcon} />
          ) : item.isCurrentStep ? (
            <Box variant={"deliveryTimelineCurrentCircle"} />
          ) : item.isFutureStep ? (
            <Box variant={"deliveryTimelineFutureCircle"} />
          ) : null}
          {index !== totalStagesArray.length - 1 &&
            (item.solidBorderRequired || item.dashedBorderRequired) && (
              <Flex
                sx={{
                  ...styles.divider,
                  borderColor: item.solidBorderRequired
                    ? "CENTS_BLUE"
                    : "BACKGROUND_GREY",
                  borderBottom: item.solidBorderRequired ? "2px solid" : "2px dashed",
                }}
              />
            )}
        </React.Fragment>
      ))}
    </Flex>
  );
};

const styles = {
  completeOval: timelineCircleDimensions.large,
  timelineContainer: {
    bg: "WHITE",
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    pt: "3px",
    mr: "16px",
    ml: "16px",
  },
  divider: {
    flexGrow: 1,
    borderBottom: "2px solid",
  },
};

export default HorizontalTimeline;
