import {getBusinessByCustomUrl} from "api/online-order";
import atob from "atob";

const oldLinkTypeUsersCount = process.env.REACT_APP_INCREMENTAL_THEMES_ID_COUNT || 10000;
const newTypeIdIncrement = 10000;
const maxDecodedId = 10 ** 7;

export const checkEncodedId = (decodedId) => decodedId > 0 && decodedId < maxDecodedId;

export const checkBusinessId = (decodedId, encodedId) =>
  encodedId <= Number(oldLinkTypeUsersCount) && !decodedId;

const incrementalIdDecrypt = function (encodedId) {
  try {
    let decodedId;
    if (encodedId) {
      const possibleId = parseInt(atob(encodedId), 36) - newTypeIdIncrement;
      const isEncodedId = checkEncodedId(possibleId);

      if (isEncodedId) {
        decodedId = possibleId;
      }
    }
    return decodedId;
  } catch (e) {
    return false;
  }
};

export const businessIdDecrypt = async function (encodedId) {
  const decodedId = incrementalIdDecrypt(`${encodedId}`);
  let businessId;

  const isBusinessId = checkBusinessId(decodedId, encodedId);
  const isEncodedId = checkEncodedId(decodedId);

  if (isBusinessId) {
    businessId = encodedId;
  } else if (isEncodedId) {
    businessId = decodedId;
  } else {
    const {
      data: {business},
    } = await getBusinessByCustomUrl(encodedId);
    businessId = business?.id;
  }

  return businessId;
};
