import {rest} from "msw";
import {UnVerifiedCustomer, VerifiedCustomer} from "../factories/customer";

const authHandlers = [
  rest.post(
    `${process.env.REACT_APP_BASE_URL}live-status/request-otp`,
    (req, res, ctx) => {
      const {phoneNumber} = req.body;

      return phoneNumber === VerifiedCustomer.phoneNumber
        ? res(ctx.json({otpCode: VerifiedCustomer.otp}))
        : phoneNumber === UnVerifiedCustomer.phoneNumber
        ? res(ctx.json({otpCode: UnVerifiedCustomer.otp}))
        : res(ctx.status(404), ctx.json({error: "Something went wrong"}));
    }
  ),
];

export default authHandlers;
