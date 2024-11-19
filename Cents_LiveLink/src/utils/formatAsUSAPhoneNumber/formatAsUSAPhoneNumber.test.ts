import {formatAsUSAPhoneNumber} from "./formatAsUSAPhoneNumber";

describe("formatAsUSAPhoneNumber", () => {
  it("should return right formatted phone number", () => {
    const actual = formatAsUSAPhoneNumber("555 111 6666");
    expect(actual).toBe("(555) 111 - 6666");
  });
  it("should return null if quantity of digits in number doesn't match", () => {
    const actual = formatAsUSAPhoneNumber("555111 66");
    expect(actual).toBeNull();
  });
  it("should return null if number is empty string", () => {
    const actual = formatAsUSAPhoneNumber("");
    expect(actual).toBeNull();
  });
});
