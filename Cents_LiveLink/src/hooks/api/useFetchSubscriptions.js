import {useCallback, useState} from "react";
import {toast} from "react-toastify";

import {fetchSubscriptions} from "../../api/subscriptions";

import {ToastError} from "../../components/common";

const useFetchSubscriptions = (initialState = {}) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(initialState.loading || false);

  const getSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchSubscriptions();
      if (res?.data?.success) {
        setSubscriptions(res?.data?.subscriptions || []);
      }
    } catch (error) {
      toast.error(<ToastError message={"Error while fetching recurring orders"} />);
    } finally {
      setLoading(false);
    }
  }, []);

  return {loading, subscriptions, getSubscriptions, setSubscriptions};
};

export default useFetchSubscriptions;
