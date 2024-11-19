import {rest} from "msw";

const subscriptionHandlers = [
  rest.get(
    `${process.env.REACT_APP_BASE_URL}api/v1/live-status/subscriptions`,
    (_, res, ctx) => {
      return res(
        ctx.json({
          subscriptions: [],
        })
      );
    }
  ),
  rest.patch(
    `${process.env.REACT_APP_BASE_URL}api/v1/live-status/subscriptions`,
    () => {}
  ),
];

export default subscriptionHandlers;
