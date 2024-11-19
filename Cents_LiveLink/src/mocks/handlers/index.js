import customerHandlers from "./customer";
import subscriptionHandlers from "./subscriptions";
import authHandlers from "./auth";

const handlers = [...subscriptionHandlers, ...customerHandlers, ...authHandlers];

export default handlers;
