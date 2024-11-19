import {Fragment, useState} from "react";
import {Flex} from "rebass/styled-components";

import {ToggleButton} from "components/common";

import CustomAmount from "../customAmount";
import ButtonAmount from "../buttonAmount";

import styles from "./styles";

interface ITogglePriceProps {
  amount: number;
  setAmount: (data: number) => void;
}
const AMOUNT_CHOOSE_LIST = [10, 30, 50];

const TogglePrice = ({amount, setAmount}: ITogglePriceProps) => {
  const [showModalCreditCustomState, toggleShowModalCreditCustomState] = useState(false);

  return (
    <>
      <Flex sx={styles.buttonWrapper}>
        {AMOUNT_CHOOSE_LIST.map((amountItem, index) => (
          <Fragment key={index}>
            <ButtonAmount
              amountItem={amountItem}
              currAmount={amount}
              setCurrAmount={setAmount}
            />
          </Fragment>
        ))}

        <ToggleButton
          onChange={() => toggleShowModalCreditCustomState(!showModalCreditCustomState)}
          sx={styles.button}
        >
          Other
        </ToggleButton>
      </Flex>
      <CustomAmount
        showModal={showModalCreditCustomState}
        toggleShowModal={toggleShowModalCreditCustomState}
        addNewAmount={setAmount}
      />
    </>
  );
};

export default TogglePrice;
