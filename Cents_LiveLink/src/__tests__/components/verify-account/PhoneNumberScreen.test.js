import React from "react";
import {render, waitFor, fireEvent} from "@testing-library/react";

import {VerifiedCustomer, UnVerifiedCustomer} from "../../../mocks/factories/customer";
import phoneNumberScreenTestids from "../../../mocks/testids/PhoneNumberScreen.testids";

import PhoneNumberScreen from "../../../components/verify-account/PhoneNumberScreen";

const renderPhoneNumberScreen = props => {
  const {getByTestId, findByTestId, queryByTestId, getByText} = render(
    <PhoneNumberScreen {...props} />
  );

  return {getByTestId, findByTestId, queryByTestId, getByText};
};

describe("PhoneNumberScreen Component", () => {
  // TODO: Check if we can manipulate MaskedInput used for phoneNumber.

  describe("When no phoneNumber is given", () => {
    it("should match snapshot", () => {
      expect(
        render(<PhoneNumberScreen phoneNumber={""} setLoading={jest.fn()} />)
      ).toMatchSnapshot();
    });

    it("should not display button or first name or last name input", async () => {
      const {queryByTestId} = renderPhoneNumberScreen({
        phoneNumber: "",
        setLoading: jest.fn(),
        onSendVerificationClick: jest.fn(),
      });
      expect(queryByTestId(phoneNumberScreenTestids.sendVerificationButton)).toBeNull();
      expect(queryByTestId(phoneNumberScreenTestids.firstNameInput)).toBeFalsy();
      expect(queryByTestId(phoneNumberScreenTestids.lastNameInput)).toBeFalsy();
    });
  });

  describe("When verified 10 digit phoneNumber is given", () => {
    it("should match snapshot", () => {
      expect(
        render(
          <PhoneNumberScreen
            phoneNumber={VerifiedCustomer.phoneNumber}
            setLoading={jest.fn()}
          />
        )
      ).toMatchSnapshot();
    });

    it("should display welcome back text and verification button", async () => {
      const {getByText} = renderPhoneNumberScreen({
        phoneNumber: VerifiedCustomer.phoneNumber,
        setLoading: jest.fn(),
      });

      await waitFor(() =>
        expect(getByText(`Welcome back, ${VerifiedCustomer.firstName}`)).not.toBeNull()
      );

      await waitFor(() =>
        expect(getByText("Verify your account to login")).not.toBeNull()
      );

      await waitFor(() => expect(getByText("SEND VERIFICATION CODE")).not.toBeNull());
    });

    it("should call onSendVerificationClick with no args when submit btn is clicked", async () => {
      const onSendVerificationClick = jest.fn();
      const {findByTestId} = renderPhoneNumberScreen({
        phoneNumber: VerifiedCustomer.phoneNumber,
        setLoading: jest.fn(),
        onSendVerificationClick: onSendVerificationClick,
      });

      const button = await findByTestId(phoneNumberScreenTestids.sendVerificationButton);

      fireEvent.click(button);

      expect(onSendVerificationClick).toBeCalledTimes(1);
      expect(onSendVerificationClick).toBeCalledWith(null);
    });
    // TODO: If we can manipulate MaskedInput used for phoneNumber,
    // changing the value less than 10 digits shold take the customer back to initial stage.
    describe("When the admin/manager is authorised", () => {});
  });

  describe("When un-verified 10 digit phoneNumber is given", () => {
    it("should match snapshot", () => {
      expect(
        render(
          <PhoneNumberScreen
            phoneNumber={UnVerifiedCustomer.phoneNumber}
            setLoading={jest.fn()}
          />
        )
      ).toMatchSnapshot();
    });

    it("should display verify your phone number and verification button", async () => {
      const {getByText} = renderPhoneNumberScreen({
        phoneNumber: UnVerifiedCustomer.phoneNumber,
        setLoading: jest.fn(),
      });

      await waitFor(() => expect(getByText("Verify Your Account")).not.toBeNull());

      await waitFor(() =>
        expect(
          getByText("We’ll send you a text with a code to create your account.")
        ).not.toBeNull()
      );

      await waitFor(() => expect(getByText("SEND VERIFICATION CODE")).not.toBeNull());
    });

    it("SEND VERIFICATION CODE should be disabled if first name and last name were empty", async () => {
      const {findByTestId} = renderPhoneNumberScreen({
        phoneNumber: UnVerifiedCustomer.phoneNumber,
        setLoading: jest.fn(),
      });
      const button = await findByTestId(phoneNumberScreenTestids.sendVerificationButton);
      expect(button).toBeDisabled();
    });

    it("SEND VERIFICATION CODE should be disabled if either of first name or last name were empty", async () => {
      const onSendVerificationClick = jest.fn();
      const {findByTestId, getByTestId} = renderPhoneNumberScreen({
        phoneNumber: UnVerifiedCustomer.phoneNumber,
        setLoading: jest.fn(),
        onSendVerificationClick: onSendVerificationClick,
      });
      const button = await findByTestId(phoneNumberScreenTestids.sendVerificationButton);
      fireEvent.change(getByTestId(phoneNumberScreenTestids.firstNameInput), {
        target: {value: UnVerifiedCustomer.firstName},
      });
      expect(button).toBeDisabled();
    });

    it("should call onSendVerificationClick with args when submit btn is clicked", async () => {
      const onSendVerificationClick = jest.fn();
      const {findByTestId, getByTestId} = renderPhoneNumberScreen({
        phoneNumber: UnVerifiedCustomer.phoneNumber,
        setLoading: jest.fn(),
        onSendVerificationClick: onSendVerificationClick,
      });
      const button = await findByTestId(phoneNumberScreenTestids.sendVerificationButton);
      fireEvent.change(getByTestId(phoneNumberScreenTestids.firstNameInput), {
        target: {value: UnVerifiedCustomer.firstName},
      });
      fireEvent.change(getByTestId(phoneNumberScreenTestids.lastNameInput), {
        target: {value: UnVerifiedCustomer.lastName},
      });
      fireEvent.click(button);
      expect(onSendVerificationClick).toBeCalledTimes(1);
      expect(onSendVerificationClick).toBeCalledWith({
        fullName: `${UnVerifiedCustomer.firstName} ${UnVerifiedCustomer.lastName}`.trim(),
        phoneNumber: UnVerifiedCustomer.phoneNumber,
      });
    });
    // TODO: If we can manipulate MaskedInput used for phoneNumber,
    // changing the value less than 10 digits shold take the customer back to initial stage.
    describe("When the admin/manager is authorised", () => {});
  });
});
