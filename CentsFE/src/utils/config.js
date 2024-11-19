export const BASE_URL = process.env.REACT_APP_BASE_URL;
export const SOCKET_BASE_URL = process.env.REACT_APP_SOCKET_BASE_URL;
export const STRIPE_KEY = process.env.REACT_APP_STRIPE_KEY;
export const REACT_ENV = process.env.REACT_APP_ENV;
export const REACT_APP_LIVE_LINK_URL = process.env.REACT_APP_LIVE_LINK_URL;
export const PUSHER_APP_CLUSTER = process.env.REACT_APP_PUSHER_APP_CLUSTER;
export const PUSHER_APP_KEY = process.env.REACT_APP_PUSHER_APP_KEY;
export const LAUNCHDARKLY_KEY = process.env.REACT_APP_LAUNCHDARKLY_KEY;
export const LAUNCHDARKLY_USER = process.env.REACT_APP_LAUNCHDARKLY_USER;
export const INTERCOM_APP_ID = process.env.REACT_APP_INTERCOM_APP_ID;

export const SESSION_ENV_KEY = `ADMIN_TRYCENTS:${(
  REACT_ENV || "development"
).toUpperCase()}:SESSION`;
