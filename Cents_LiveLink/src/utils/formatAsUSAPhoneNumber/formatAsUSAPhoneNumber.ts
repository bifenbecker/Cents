import {NOT_DIGITS_REGEXP, PHONE_NUMBER_FORMAT_REGEXP} from "../../constants/constants";

export const formatAsUSAPhoneNumber = (phoneNumberString: string) => {
  const cleanedPhoneNumber = `${phoneNumberString}`.replace(NOT_DIGITS_REGEXP, "");

  const match = cleanedPhoneNumber.match(PHONE_NUMBER_FORMAT_REGEXP);
  if (match) {
    return "(" + match[1] + ") " + match[2] + " - " + match[3];
  }
  return null;
};
