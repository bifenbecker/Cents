import {useState, ChangeEvent} from "react";
import {Flex, Text, Button} from "rebass/styled-components";
import {toast} from "react-toastify";

import {DockModal, TextField, ToastError} from "components/common";

import styles from "./styles";

interface ICustomAmountProps {
  addNewAmount: (amount: number) => void;
  showModal: boolean;
  toggleShowModal: (status: boolean) => void;
}

const AVAILABLE_CREDIT_MIN_AMOUNT = 5;
const EXCEPT_DIGITS_POINT_REGEX = /[^0-9.]/g;

const CustomAmount = ({addNewAmount, showModal, toggleShowModal}: ICustomAmountProps) => {
  const [amountState, setAmountState] = useState<number | null>();

  const handlePromoCodeChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newInput = Number(
      Number(event.target.value.replace(EXCEPT_DIGITS_POINT_REGEX, "")).toFixed(2)
    );

    setAmountState(newInput);
  };

  const closeModal = () => {
    setAmountState(null);
    toggleShowModal(!showModal);
  };

  const sendNewAmountCredit = () => {
    if (amountState) {
      if (amountState < AVAILABLE_CREDIT_MIN_AMOUNT) {
        toast.error(
          <ToastError
            message={`Your balance cannot be less than $${AVAILABLE_CREDIT_MIN_AMOUNT.toFixed(
              2
            )}.`}
          />
        );
        return;
      }

      addNewAmount(amountState);
      closeModal();
    }
  };

  return (
    <DockModal
      header="Custom Amount"
      isOpen={showModal}
      toggle={() => {
        closeModal();
      }}
    >
      <Flex sx={styles.wrapperModal}>
        <Flex sx={styles.wrapperContent}>
          <Text sx={styles.normalText}>
            Please enter the custom amount you would like to add to your credit balance.
            <Text sx={styles.boldText}>
              Minimum ${AVAILABLE_CREDIT_MIN_AMOUNT.toFixed(2)}
            </Text>
            .
          </Text>
          <TextField
            label="Custom Amount"
            type="text"
            value={amountState || ""}
            onChange={handlePromoCodeChange}
            materialWrapperStyle={styles.materialWrapperStyle}
            wrapperInputStyle={styles.wrapperInputStyle}
          />
        </Flex>
        <Button onClick={sendNewAmountCredit} sx={styles.saveButton}>
          Save
        </Button>
      </Flex>
    </DockModal>
  );
};

export default CustomAmount;
