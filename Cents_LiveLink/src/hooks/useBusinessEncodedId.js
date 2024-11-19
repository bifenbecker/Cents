import {useEffect, useState} from "react";
import {businessIdDecrypt} from "utils/encodedIdDecrypt";

export const useBusinessEncodedId = (encodedBusinessId) => {
  const [businessId, setBusinessId] = useState(null);
  useEffect(() => {
    const getBusinessId = async () => {
      const possibleBusinessId = await businessIdDecrypt(encodedBusinessId);
      setBusinessId(possibleBusinessId);
    };
    if (businessId === null) {
      getBusinessId();
    }
  }, [encodedBusinessId, businessId]);

  return businessId && String(businessId);
};
