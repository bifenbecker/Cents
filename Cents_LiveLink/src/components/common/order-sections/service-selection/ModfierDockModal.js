import React, {useState, useEffect} from "react";
import {Box, Flex, Button} from "rebass/styled-components";

import styles from "./DockModalForm.styles";

import {DockModal} from "../..";
import ModifierButton from "../../../online-order/business/online-order-form/common/service-selection/modifier-button";

const ModifierDockModal = props => {
  const {isOpen, toggle, modifiers, selectedModifierIds, onModifierIdsChange} = props;

  const [modiferIds, setModifierIds] = useState(selectedModifierIds);

  useEffect(() => {
    setModifierIds(isOpen ? selectedModifierIds : []);
  }, [isOpen, selectedModifierIds]);

  const setServiceModifierIds = modifier => {
    if (modiferIds?.includes(modifier.id)) {
      const updatedModifiers = modiferIds.filter(
        data => Number(data) !== Number(modifier.id)
      );
      setModifierIds([...updatedModifiers]);
    } else {
      setModifierIds([...modiferIds, modifier.id]);
    }
  };

  const onSave = () => {
    onModifierIdsChange(modiferIds);
    toggle();
  };

  return (
    <DockModal
      showExitIcon
      header="Choose Add-Ons"
      isOpen={isOpen}
      toggle={toggle}
      size={0.67}
    >
      <Box {...styles.cardContainer}>
        <Box {...styles.serviceContainer}>
          {modifiers?.map(modifier => {
            return (
              <ModifierButton
                {...(modiferIds?.includes(modifier.id)
                  ? styles.services.checkedButton
                  : styles.services.modifierButton)}
                key={modifier.id}
                modifier={modifier}
                checked={modiferIds?.includes(modifier.id)}
                onChange={() => setServiceModifierIds(modifier)}
              />
            );
          })}
        </Box>
      </Box>
      <Flex {...styles.footer.wrapper}>
        <Button {...styles.footer.button} onClick={onSave}>
          {modiferIds?.length ? "SAVE ADD-ONS" : "NO ADD-ONS"}
        </Button>
      </Flex>
    </DockModal>
  );
};

export default ModifierDockModal;
