import React, {useEffect, useState} from "react";
import DockModal from "../../../DockModal.js";
import {Flex} from "rebass/styled-components";
import PreferencesForm from "./Form.js";
import {Box} from "@material-ui/core";
import {
  createCustomerOptionSelection,
  deleteCustomerOptionSelection,
  fetchPreferences,
  updateCustomerOptionSelection,
} from "../../../../../api/online-order";
import {useHookstate} from "@hookstate/core";
import {onlineOrderState} from "../../../../../state/online-order";
import {fetchBusinessSettings} from "../../../../../api/business";
import useWindowSize from "../../../../../hooks/useWindowSize";
import {toast} from "react-toastify";
import {updateCustomerNotes} from "../../../../../api/customer";

const styles = {
  wrapper: {
    height: "calc(100% - 67px)",
    flexDirection: "column",
    justifyContent: "space-between",
    py: "18px",
    overflow: "auto",
  },
};

const GENERIC_ERROR_MSG = "something went wrong, please try again later";

const PreferenceDockForm = ({
  header,
  isOpen,
  toggle,
  businessId,
  customer,
  fromManageOrder,
  saveSelections,
}) => {
  const businessIdFromHookState = useHookstate(onlineOrderState.businessId);
  const businessIdToUse = businessId || businessIdFromHookState;
  const hangDryCustomerInstructionsState = useHookstate(
    onlineOrderState.hangDryInstructions
  );
  const isHangDrySelectedState = useHookstate(onlineOrderState.isHangDrySelected);
  const customerNotesState = useHookstate(onlineOrderState.customerNotes);

  const [preferences, setPreferences] = useState({});
  const [, height] = useWindowSize();

  const applySingleSelection = async (newSelectedOption, preference) => {
    // we check if an option has already been selected for the given pref first
    const currentSelected = preference.options.find(option => option.selected);
    if (currentSelected && typeof currentSelected.selectionId !== "undefined") {
      // if yes, we replace the current selection by the new one
      await updateCustomerOptionSelection(currentSelected.selectionId, {
        newOptionId: newSelectedOption.id,
      });
    } else {
      // if not, we create a new selection
      await createCustomerOptionSelection({preferenceOptionId: newSelectedOption.id});
    }
  };

  const applyMultiSelection = async selectedOption => {
    // we check if the selection already in selected state (users toggle off selection)
    if (selectedOption.selected && typeof selectedOption.selectionId !== "undefined") {
      // in that case, users want to unselect the option, we delete the selection
      await deleteCustomerOptionSelection(selectedOption.selectionId);
    } else {
      // otherwise it's a new selection
      await createCustomerOptionSelection({preferenceOptionId: selectedOption.id});
    }
  };

  const handleSelectionChange = async (selection, preference) => {
    try {
      if (preference.type === "single") {
        await applySingleSelection(selection, preference);
      } else {
        await applyMultiSelection(selection, preference);
      }

      const updatedPreferences = await fetchPreferences(businessIdToUse);
      if (updatedPreferences.data.success && updatedPreferences.data.preferences) {
        setPreferences({
          ...preferences,
          businessCustomerPreferences: updatedPreferences.data.preferences,
        });
      }
    } catch (e) {
      toast.error(GENERIC_ERROR_MSG);
    }
  };

  useEffect(() => {
    async function initPreferences() {
      try {
        const [customerPrefsResp, businessSettingsResp] = await Promise.all([
          fetchPreferences(businessIdToUse),
          fetchBusinessSettings(businessIdToUse),
        ]);

        if (customerPrefsResp.data.success && businessSettingsResp.data.success) {
          let prefs = {
            enabled:
              businessSettingsResp.data.businessSettings?.isCustomPreferencesEnabled,
            businessCustomerPreferences: customerPrefsResp.data.preferences,
            hangDry: {
              enabled: businessSettingsResp.data.businessSettings?.isHangDryEnabled,
              instructions:
                businessSettingsResp.data.businessSettings?.hangDryInstructions,
            },
          };
          setPreferences(prefs);
        } else {
          toast.error(GENERIC_ERROR_MSG);
        }
      } catch (e) {
        toast.error("something went wrong, please try again later");
      }
    }

    initPreferences();
  }, [businessIdToUse]);

  const handleSave = async ({
    customerNotes,
    isHangDrySelected,
    hangDryCustomerInstructions,
  }) => {
    if (fromManageOrder) {
      const params = {
        notes: customerNotes,
        isHangDrySelected: isHangDrySelected,
        hangDryInstructions: hangDryCustomerInstructions,
      };

      await updateCustomerNotes(customer?.storeCustomerId, params);
      saveSelections(params, customerNotes);
    } else {
      hangDryCustomerInstructionsState.set(hangDryCustomerInstructions);
      customerNotesState.set(customerNotes);
      isHangDrySelectedState.set(isHangDrySelected);
    }
    toggle();
  };

  return (
    <DockModal
      header={header}
      isOpen={isOpen}
      toggle={toggle}
      size={0.9 * height}
      fixedSize
    >
      <Flex {...styles.wrapper}>
        <Box>
          <PreferencesForm
            preferences={preferences}
            onChangeSelection={handleSelectionChange}
            onSave={handleSave}
            regularPreferences={{
              isHangDrySelected: fromManageOrder
                ? customer?.isHangDrySelected
                : isHangDrySelectedState.get(),
              hangDryInstructions: fromManageOrder
                ? customer?.hangDryInstructions
                : hangDryCustomerInstructionsState.get(),
              notes: fromManageOrder ? customer?.notes : customerNotesState.get(),
            }}
          />
        </Box>
      </Flex>
    </DockModal>
  );
};

export default PreferenceDockForm;
