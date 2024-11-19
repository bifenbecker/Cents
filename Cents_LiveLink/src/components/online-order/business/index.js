import {useEffect} from "react";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import PageNotFound from "components/page-not-found";
import Business from "./Business";
import {useAppDispatch} from "app/hooks";
import {onlineOrderThunks} from "../redux";
import {getOrderInitialData} from "../redux/selectors";
import {FETCHING_STATUS} from "constants/api";

export const BusinessWithBusinessId = () => {
  const {businessId: encodedBusinessId, storeId: encodedStoreId} = useParams();
  const dispatch = useAppDispatch();
  const {fetchingStatus} = useSelector(getOrderInitialData);

  useEffect(() => {
    if (fetchingStatus === FETCHING_STATUS.INITIAL)
      dispatch(
        onlineOrderThunks.getOrderInitialData({
          businessId: encodedBusinessId,
          storeId: encodedStoreId,
        })
      );
  }, [dispatch, encodedBusinessId, encodedStoreId, fetchingStatus]);

  switch (true) {
    case fetchingStatus === FETCHING_STATUS.FULFILLED:
      return <Business />;
    case fetchingStatus === FETCHING_STATUS.REJECTED:
      return <PageNotFound />;
    default:
      return null;
  }
};
