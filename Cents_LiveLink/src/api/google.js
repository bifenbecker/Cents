import axios from "axios";

import {GOOGLE_PLACES_API_KEY, GOOGLE_PLACES_FIND_TIMEZONE_URL} from "../utils/config";

export const getTimezoneFromLatLng = async ({lat, lng}) => {
  return await axios({
    method: "GET",
    url: GOOGLE_PLACES_FIND_TIMEZONE_URL,
    params: {
      location: `${lat},${lng}`,
      timestamp: Math.round(new Date().getTime() / 1000),
      key: GOOGLE_PLACES_API_KEY,
    },
  });
};
