import React, {useState, useMemo} from "react";
import {Box, Flex, Text} from "rebass/styled-components";
import {Button} from "@material-ui/core/";

// Assets & Styles
import {
  DryCleaningIllustration,
  LaundryServiceIllustration,
  CheckIcon,
} from "../../../../../../assets/images";

// Components
import {DockModal, ServiceSelectionImageCard} from "../../../../../common";
import {onlineOrderActions} from "components/online-order/redux";

// Hooks
import useWindowSize from "../../../../../../hooks/useWindowSize";
import {useAppDispatch} from "app/hooks";

import {SERVICE_CATEGORY_TYPES} from "components/online-order/constants";

const ServiceSelectionDrawer = (props) => {
  const {isOpen, storeCustomerSelections} = props;
  const [, height] = useWindowSize();
  const [dryCleaningSelected, setDryCleaningSelected] = useState(false);
  const [laundrySelected, setLaundrySelected] = useState(false);
  const dispatch = useAppDispatch();
  /**
   * Set laundry selection in state
   */
  const setLaundrySelection = () => {
    setLaundrySelected(!laundrySelected);
  };

  /**
   * Set dry cleaning selection in state
   */
  const setDryCleaningSelection = () => {
    setDryCleaningSelected(!dryCleaningSelected);
  };

  /**
   * Pass the initial customer selections to the parent
   */
  const onSubmit = () => {
    const selectedServices = [];
    if (dryCleaningSelected) {
      selectedServices.push(SERVICE_CATEGORY_TYPES.DRY_CLEANING);
    }
    if (laundrySelected) {
      selectedServices.push(SERVICE_CATEGORY_TYPES.LAUNDRY);
    }
    dispatch(onlineOrderActions.setSelectedServices(selectedServices));
    storeCustomerSelections(dryCleaningSelected, laundrySelected);
  };

  const getSize = useMemo(() => {
    if (height < 600) {
      return 1;
    } else if (height > 750) {
      return 0.58;
    } else {
      return 0.84;
    }
  }, [height]);

  return (
    <DockModal
      header="Service Type"
      isOpen={!!isOpen}
      provideBackOption={false}
      size={getSize}
      loading={false}
    >
      <Box {...styles.wrapper}>
        <Flex {...styles.body}>
          <Text {...styles.description}>Which type of service would you like?</Text>
          <Box paddingTop="18px" width="100%">
            <ServiceSelectionImageCard
              imageSource={DryCleaningIllustration}
              title="Dry Cleaning"
              itemSelected={dryCleaningSelected}
              activeStateImage={CheckIcon}
              onClick={setDryCleaningSelection}
              illustrationDimensions={{height: "110px", width: "125px"}}
            />
          </Box>
          <Box paddingTop="18px" width="100%">
            <ServiceSelectionImageCard
              imageSource={LaundryServiceIllustration}
              title="Laundry"
              itemSelected={laundrySelected}
              activeStateImage={CheckIcon}
              onClick={setLaundrySelection}
              illustrationDimensions={{height: "72px", width: "95px"}}
            />
          </Box>
        </Flex>
        <Flex {...styles.footer.wrapper}>
          <Button
            color="primary"
            variant="contained"
            disabled={!laundrySelected && !dryCleaningSelected}
            onClick={onSubmit}
            className="service-button"
          >
            NEXT
          </Button>
        </Flex>
      </Box>
    </DockModal>
  );
};

const styles = {
  description: {
    fontSize: "18px",
    color: "BLACK",
    fontFamily: "secondary",
  },
  wrapper: {
    marginLeft: "21px",
    marginRight: "18px",
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "column",
  },
  body: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "column",
  },
  error: {
    pb: "10px",
  },
  footer: {
    wrapper: {
      p: "24px 0px",
      alignItems: "center",
      justifyContent: "center",
    },
  },
};

export default ServiceSelectionDrawer;
