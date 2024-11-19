import {useParams} from "react-router-dom";
import OrderPickupForm from "./OnlineOrderWithBusinessId";
import {useBusinessEncodedId} from "hooks/useBusinessEncodedId";

export const OnlineOrderWithBusinessId = ({...props}) => {
  const {businessId: encodedBusinessId} = useParams();
  const businessId = useBusinessEncodedId(encodedBusinessId);
  return (
    <>{businessId ? <OrderPickupForm {...props} businessId={businessId} /> : null}</>
  );
};
