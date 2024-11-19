import {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {Box, Flex, Image, Heading, Card, Button, Text} from "rebass/styled-components";
import {toast} from "react-toastify";
import {useFlags} from "launchdarkly-react-client-sdk";

import {SELF_SERVE_INFO_PATH} from "constants/paths";
import {useAppDispatch} from "app/hooks";
import NumberCounter from "components/common/NumberCounter";
import {priceToDollars} from "utils/payment";
import {Loader, ToastError} from "components/common";
import {ICustomer} from "types/customer";
import {UnloadedWashingMachine} from "assets/images";

import {IMachine, ISelfServeOrder} from "../../types";
import {DRYER_PREFIX} from "../../constants/selfServeGeneral";
import {selfServeThunks} from "../../redux";

import styles from "./styles";

const DEFAULT_MINS = 1;

const getQuantity = (newNumberMinutes = DEFAULT_MINS, oldNumberMinutes = DEFAULT_MINS) =>
  newNumberMinutes / oldNumberMinutes;

interface IProps {
  machineDetails: IMachine;
  customer: ICustomer | null;
}

function SelfServeOrder({machineDetails, customer}: IProps) {
  const {
    pricePerTurnInCents,
    turnTimeInMinutes,
    prefix,
    name,
    isAvailable,
    id,
  } = machineDetails;

  const flags = useFlags();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const sendSelfServeOrderDispatch = (data: ISelfServeOrder) =>
    dispatch(selfServeThunks.sendSelfServeOrder(data));

  const [minutesState, setMinutesState] = useState<number | null>(null);
  const [initMinutesState, setInitMinutesState] = useState(DEFAULT_MINS);
  const [totalPriceState, setTotalPriceState] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMinutesState(turnTimeInMinutes);
    setInitMinutesState(turnTimeInMinutes || DEFAULT_MINS);
  }, [turnTimeInMinutes]);

  useEffect(() => {
    if (
      !machineDetails.isAvailable &&
      machineDetails.activeTurn?.id &&
      machineDetails.activeTurn?.storeCustomerId &&
      customer?.storeCustomers[0]?.id === machineDetails.activeTurn.storeCustomerId
    ) {
      history.push(`${SELF_SERVE_INFO_PATH}/${machineDetails.activeTurn.id}`);
    }
  }, [
    history,
    customer?.storeCustomers,
    machineDetails.activeTurn?.id,
    machineDetails.activeTurn?.storeCustomerId,
    machineDetails.isAvailable,
  ]);

  useEffect(() => {
    setTotalPriceState(pricePerTurnInCents);
  }, [pricePerTurnInCents]);

  useEffect(() => {
    if (prefix === DRYER_PREFIX && pricePerTurnInCents && minutesState) {
      const quantity = getQuantity(minutesState, initMinutesState);
      const totalPrice = quantity * pricePerTurnInCents;
      setTotalPriceState(totalPrice);
    }
  }, [initMinutesState, minutesState, prefix, pricePerTurnInCents]);

  const sendOrder = async () => {
    if (id && pricePerTurnInCents) {
      setLoading(true);
      try {
        const quantity = getQuantity(Number(minutesState), initMinutesState);
        const response = await sendSelfServeOrderDispatch({
          machineId: id,
          quantity,
        }).unwrap();
        if (response) {
          toast.success("Your order's in!");
          history.push(`${SELF_SERVE_INFO_PATH}/${response}`);
        }
      } catch (error) {
        const err = error as {message: string};
        toast.error(<ToastError message={err.message} />);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!flags?.selfServeOrdering) {
    return <></>;
  }

  return (
    <Flex sx={styles.wrapper}>
      {isAvailable ? (
        <>
          <Box>
            <Card sx={styles.cardContainer}>
              <Flex justifyContent="space-between">
                <Box>
                  <Flex flexDirection="column" alignItems="start">
                    {prefix && name && (
                      <Heading>
                        {prefix}-{name}
                      </Heading>
                    )}
                    <Button sx={styles.buttonAvailable}>Available</Button>
                    {minutesState && prefix === DRYER_PREFIX && (
                      <NumberCounter
                        measure="mins"
                        count={minutesState}
                        onCountChange={setMinutesState}
                        max={200}
                        step={initMinutesState}
                      />
                    )}
                  </Flex>
                </Box>
                <Image src={UnloadedWashingMachine} />
              </Flex>
            </Card>
          </Box>
          <Box>
            <Flex sx={styles.buttonWrapper}>
              <Button variant="primary" sx={styles.button} onClick={sendOrder}>
                PAY ${priceToDollars(totalPriceState)} + ENABLE START
              </Button>
              <Text sx={styles.poweredByCents}>Powered by Cents</Text>
            </Flex>
          </Box>
        </>
      ) : (
        <Box>
          <Flex flexDirection="column" alignItems="center">
            {prefix && name && (
              <Text sx={styles.machineName}>
                {prefix}-{name}
              </Text>
            )}
            <Heading sx={styles.notAvailable}>This machine is not available.</Heading>
            <Image p="10px" src={UnloadedWashingMachine} />
          </Flex>
          <Text sx={styles.description}>
            This machine is not currently available. Please scan an available machine to
            get started.
          </Text>
        </Box>
      )}
      {loading && <Loader />}
    </Flex>
  );
}

export default SelfServeOrder;
