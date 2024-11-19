import {ToggleButton} from "components/common";

import styles from "./styles";

interface IPriceButtonProps {
  currAmount: number;
  setCurrAmount: (price: number) => void;
  amountItem: number;
}

const ButtonAmount = ({currAmount, amountItem, setCurrAmount}: IPriceButtonProps) => (
  <ToggleButton
    onChange={() => setCurrAmount(amountItem)}
    sx={currAmount === amountItem ? styles.activeButton : styles.button}
  >
    ${amountItem}
  </ToggleButton>
);

export default ButtonAmount;
