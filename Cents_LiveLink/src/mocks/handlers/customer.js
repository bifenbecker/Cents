import {rest} from "msw";
import {VerifiedCustomer} from "../factories/customer";

const customerHandlers = [
  rest.get(
    `${process.env.REACT_APP_BASE_URL}live-status/customer/verify`,
    (req, res, ctx) => {
      const phoneNumber = req.url.searchParams.get("phoneNumber");

      return res(
        phoneNumber === VerifiedCustomer.phoneNumber
          ? ctx.json({
              isVerified: true,
              firstName: VerifiedCustomer.firstName,
            })
          : ctx.json({isVerified: false})
      );
    }
  ),
];

export default customerHandlers;
