import React, {useState} from "react";
import {Box, Flex, Image, Text, Button} from "rebass/styled-components";

// Assets & Styles
import {SidePanelIcon, RightChevronIcon} from "../../../../../../assets/images";
import {sectionStyles} from "../styles";

// Components
import {DockModal, TextField} from "../../../../../common";

// Hooks
import useToggle from "../../../../../../hooks/useToggle";

const ApplyPromo = props => {
  const {promoCode, onAddPromo} = props;

  const {isOpen: showPromoModal, toggle: toggleShowPromoModal} = useToggle();
  const [newPromoCode, setNewPromoCode] = useState(promoCode);

  /**
   * Assign the incoming event object data to the newPromoCode state value
   *
   * @param {Object} event
   */
  const handlePromoCodeChange = event => {
    setNewPromoCode(event.target.value);
  };

  const renderPromoModal = () => {
    return (
      <DockModal
        header="Apply Promo Code"
        isOpen={showPromoModal}
        toggle={() => {
          toggleShowPromoModal(!showPromoModal);
        }}
      >
        <Flex
          width="100%"
          height="80%"
          justifyContent="space-between"
          flexDirection="column"
          alignItems="center"
        >
          <TextField
            label="Promo Code"
            type="text"
            materialWrapperStyle={{width: "80%"}}
            wrapperInputStyle={{fontSize: "1rem"}}
            value={newPromoCode}
            onChange={event => {
              handlePromoCodeChange(event);
            }}
          />
          <Button
            {...styles.saveButton}
            onClick={() => {
              setNewPromoCode(newPromoCode.toUpperCase());
              onAddPromo(newPromoCode.toUpperCase());
              toggleShowPromoModal(!showPromoModal);
            }}
          >
            ADD PROMO
          </Button>
        </Flex>
      </DockModal>
    );
  };

  return (
    <>
      <Box>
        <Flex
          {...styles.section.link.wrapper}
          {...styles.section.link.lastWrapper}
          onClick={() => {
            toggleShowPromoModal(!showPromoModal);
          }}
        >
          <Box {...styles.section.link.iconWrapper}>
            <Image src={SidePanelIcon} />
          </Box>
          <Flex {...styles.section.link.dataWrapper}>
            <Box {...styles.section.link.data}>
              Promo Code
              <Text {...styles.section.link.dataSubText}>
                {promoCode ? `${promoCode}` : <i>Add a promo code</i>}
              </Text>
            </Box>
            <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
          </Flex>
        </Flex>
      </Box>
      {renderPromoModal()}
    </>
  );
};

const styles = {
  section: sectionStyles,
  saveButton: {
    sx: {
      backgroundColor: "#3D98FF",
      width: "80%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    p: "18px",
  },
};

export default ApplyPromo;
