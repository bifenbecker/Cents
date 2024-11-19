import Pusher from "pusher-js";
import {useEffect, useState} from "react";

import {
  BASE_URL,
  PUSHER_APP_KEY,
  PUSHER_APP_CLUSTER,
  SESSION_ENV_KEY,
} from "../utils/config";
import {getParsedLocalStorageData} from "../utils/functions";

const usePusher = () => {
  const [pusherClient, setPusherClient] = useState();

  useEffect(() => {
    let pusher;
    const {token: authtoken} = getParsedLocalStorageData(SESSION_ENV_KEY);

    if (PUSHER_APP_KEY && PUSHER_APP_CLUSTER) {
      Pusher.logToConsole = true;

      pusher = new Pusher(PUSHER_APP_KEY, {
        cluster: PUSHER_APP_CLUSTER,
        authEndpoint: `${BASE_URL}/pusher/auth`,
        auth: {
          headers: {
            authtoken,
            source: "BUSINESS_MANAGER",
          },
        },
      });

      // Connection successful.
      pusher.connection.bind("connected", function () {
        console.log("Pusher connection successful");
      });
      // Connection error
      pusher.connection.bind("error", function (error) {
        console.error(
          error?.error?.data?.code === 4004
            ? "Pusher connection limit error"
            : "Pusher connection error",
          error
        );
      });

      setPusherClient(pusher);
    } else {
      console.warn(
        "Required keys for Pusher are not available.",
        "Hence real time updates for machines is not available."
      );
    }

    return () => {
      if (pusher) pusher.disconnect();
      setPusherClient();
    };
  }, []);

  return pusherClient;
};

export default usePusher;
