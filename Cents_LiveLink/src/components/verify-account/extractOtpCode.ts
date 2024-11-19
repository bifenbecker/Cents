import {NOT_DIGITS_REGEXP, OTP_CODE_LENGTH} from "../../constants/constants";

export const extractOtpCode = (value: string) => {
  return value.replace(NOT_DIGITS_REGEXP, "").slice(0, OTP_CODE_LENGTH);
};
