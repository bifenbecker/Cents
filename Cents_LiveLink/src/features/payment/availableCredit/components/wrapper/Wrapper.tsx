import {Box, Flex, Image, Text} from "rebass/styled-components";
import {toast} from "react-toastify";

import {useAppDispatch, useAppSelector} from "app/hooks";
import {IconDollar, PlusIcon} from "assets/images";
import {ICustomer} from "types/customer";
import {Loader, ToastError} from "components/common";
import {FetchingStatus} from "types/common";

import ChooseAmount from "../chooseAmount";
import {availableCreditSelectors, availableCreditThunks} from "../../redux";
import {IAddCredit} from "../../types";

import styles from "./styles";

interface IAvailableCreditWrapperProps {
  headerBlockShow?: boolean;
  storeId: number | null;
  customer: ICustomer | null;
  currAvailableCredit: number;
  setCurrAvailableCredit: (data: number) => void;
  showModal: boolean;
  toggleShowModal: (status: boolean) => void;
}

const AvailableCreditWrapper = ({
  headerBlockShow = true,
  customer,
  storeId,
  currAvailableCredit,
  setCurrAvailableCredit,
  showModal,
  toggleShowModal,
}: IAvailableCreditWrapperProps) => {
  const funds = useAppSelector(availableCreditSelectors.getFunds);
  const dispatch = useAppDispatch();

  const sendAddCreditDispatch = (data: IAddCredit) =>
    dispatch(availableCreditThunks.addCreditThunk(data));

  const sendAmount = async (data: IAddCredit) => {
    try {
      const newAvailableCredit = await sendAddCreditDispatch(data).unwrap();

      setCurrAvailableCredit(newAvailableCredit);
      toast.success("Success! You added new amount!");
    } catch (error) {
      const err = error as {message: string};
      toast.error(<ToastError message={err.message} />);
    }
  };

  return (
    <Box>
      {headerBlockShow && (
        <Flex>
          <Text sx={styles.sectionHeader}>Payment</Text>
        </Flex>
      )}

      <Flex
        {...styles.section.link.wrapper}
        onClick={() => {
          toggleShowModal(!showModal);
        }}
      >
        <Box sx={styles.section.link.iconWrapper}>
          <Image src={IconDollar} />
        </Box>
        <Flex sx={styles.section.link.dataWrapper}>
          <Box sx={styles.section.link.data}>
            Available Credit
            <Text
              {...styles.section.link.dataSubText}
              color={currAvailableCredit ? "TEXT_GREY" : "TEXT_RED"}
            >
              {`$${currAvailableCredit?.toFixed(2)}`}
            </Text>
          </Box>
          <Image src={PlusIcon} sx={styles.section.link.rightChevron} />
        </Flex>
      </Flex>
      <ChooseAmount
        storeId={storeId}
        customer={customer}
        showModal={showModal}
        toggleShowModal={toggleShowModal}
        sendAmount={sendAmount}
      />
      {funds.fetchingStatus === FetchingStatus.Pending ? <Loader /> : null}
    </Box>
  );
};

export default AvailableCreditWrapper;
