import {useState, useEffect, useCallback} from "react";
import {useHistory, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {Flex} from "rebass/styled-components";
import {useFlags, useLDClient} from "launchdarkly-react-client-sdk";

import {DEFAULT_PATH} from "constants/paths";
import {useAppDispatch, useAppSelector} from "app/hooks";
import useCustomerState from "hooks/useCustomerState";
import VerifyUserModal from "components/verify-account/VerifyUserModal";
import {Layout, Loader, ToastError, WithTheme} from "components/common";
import {getFetchCustomerInfoByStoreId} from "components/online-order/services/onlineOrder";
import {ICustomer} from "types/customer";
import {FetchingStatus} from "types/common";

import {selfServeSelectors, selfServeThunks} from "../../redux";
import {ITheme} from "../../types";
import SelfServeOrder from "../order/SelfServeOrder";

import styles from "./styles";

const {getMachineDataByUniqueCode} = selfServeThunks;

function SelfServeWrapper() {
  const flags = useFlags();
  const ldClient = useLDClient();
  const history = useHistory();
  const {customerAuthToken} = useCustomerState();
  const dispatch = useAppDispatch();
  const machineDetails = useAppSelector(selfServeSelectors.getMachineDetails);
  const {uniqueCode} = useParams<{uniqueCode: string}>();

  const [showVerificationScreen, setShowVerificationScreen] = useState(
    !customerAuthToken
  );
  const [customerInfo, setCustomerInfo] = useState<ICustomer | null>(null);
  const [loadingCustomerInfo, seLoadingCustomerInfo] = useState(false);
  const [flagStatus, setFlagStatus] = useState(false);

  const fetchCustomerInformation = async (storeId?: number | null) => {
    try {
      if (!storeId) {
        throw new Error();
      }
      seLoadingCustomerInfo(true);
      const response = await getFetchCustomerInfoByStoreId(storeId);
      setCustomerInfo(response);
    } catch (error) {
      toast.error(<ToastError message="Error while fetching customer info" />);
    } finally {
      seLoadingCustomerInfo(false);
    }
  };

  const fetchData = useCallback(async () => {
    if (customerAuthToken) {
      try {
        const machine = await dispatch(getMachineDataByUniqueCode(uniqueCode)).unwrap();
        fetchCustomerInformation(machine?.store?.id);
      } catch (error) {
        toast.error(<ToastError message="This machine does not exist" />);
        history.push(DEFAULT_PATH);
      }
    }
  }, [customerAuthToken, dispatch, history, uniqueCode]);

  useEffect(() => {
    ldClient?.waitForInitialization().then(() => {
      if (flags?.selfServeOrdering) {
        setFlagStatus(true);
        fetchData();
      } else {
        history.push(DEFAULT_PATH);
      }
    });
  }, [flags?.selfServeOrdering, ldClient, fetchData, history]);

  const commonLoading =
    loadingCustomerInfo || machineDetails.fetchingStatus === FetchingStatus.Pending;

  if (!flagStatus) {
    return <></>;
  }

  return (
    <WithTheme uniqueCodeMachine={uniqueCode}>
      {(businessTheme: ITheme) => (
        <>
          <Layout logoUrl={businessTheme?.logoUrl}>
            <Flex sx={styles.wrapper}>
              <SelfServeOrder
                customer={customerInfo}
                machineDetails={machineDetails.data}
              />
            </Flex>
            <VerifyUserModal
              isOpen={showVerificationScreen}
              toggle={() => history.goBack()}
              fetchingSubscriptions={false}
              onSuccess={async () => setShowVerificationScreen((state) => !state)}
              businessId={businessTheme?.id}
              businessTheme={businessTheme}
              storeId={machineDetails.data.store.id}
            />
          </Layout>
          {commonLoading ? <Loader /> : null}
        </>
      )}
    </WithTheme>
  );
}

export default SelfServeWrapper;
