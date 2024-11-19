import React, {useMemo} from "react";
import {Box, Flex, Button} from "rebass/styled-components";

// Components
import {DockModal} from "../../../../../common";
import ModifierButton from "../service-selection/modifier-button";

// Hooks
import useWindowSize from "../../../../../../hooks/useWindowSize";

const ModifierSelectionDrawer = props => {
  const {isOpen, modifiers, setServiceModifierIds, modifierIds, onSubmit} = props;
  const [, height] = useWindowSize();

  /**
   * Set the size of the drawer according to screen height
   */
  const getSize = useMemo(() => {
    if (height < 600) {
      return 1;
    } else if (height > 750) {
      return 0.7;
    } else {
      return 0.84;
    }
  }, [height]);

  return (
    <DockModal
      header="Choose Add-Ons"
      isOpen={!!isOpen}
      provideBackOption={false}
      size={getSize}
      loading={false}
    >
      <Box {...styles.wrapper}>
        <Flex {...styles.services.wrapper}>
          {modifiers?.map(modifier => {
            return (
              <ModifierButton
                {...styles.services.button}
                key={modifier.id}
                modifier={modifier}
                checked={modifierIds.get()?.includes(modifier.id)}
                onChange={() => setServiceModifierIds(modifier)}
              />
            );
          })}
        </Flex>
      </Box>
      <Flex {...styles.footer.wrapper}>
        <Button variant="primary" {...styles.footer.button} onClick={onSubmit}>
          {modifierIds?.length > 0 ? "SAVE ADD-ONS" : "NO ADD-ONS"}
        </Button>
      </Flex>
    </DockModal>
  );
};

const styles = {
  wrapper: {
    mt: "8px",
  },
  header: {
    fontSize: "18px",
    ml: "18px",
    paddingBottom: "12px",
  },
  services: {
    wrapper: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      p: "12px 12px",
    },
    button: {
      width: "339px",
      height: "62px",
      m: "14px 8px 24px 8px",
    },
  },
  footer: {
    wrapper: {
      p: "24px 0px",
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      p: "18.5px",
      margin: "0px 20px",
      width: "100%",
    },
  },
};

export default ModifierSelectionDrawer;
