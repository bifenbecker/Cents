import React from "react";
import {render, fireEvent, waitFor} from "@testing-library/react";

import {ErrorCustomer, VerifiedCustomer} from "../../../mocks/factories/customer";
import {Store} from "../../../mocks/factories/store";
import {onlineOrderState} from "../../../state/online-order";

import VerifyUser from "../../../components/verify-account/VerifyUser";

const renderVerifyUserScreen = props => {
  const {getByText} = render(<VerifyUser {...props} />);

  return {getByText};
};

describe("VerifyUser Component", () => {
  describe("when user is not authorized(admin)", () => {
    beforeAll(() => {
      onlineOrderState.set({isAuthorized: false});
    });

    afterAll(() => {
      onlineOrderState.set({});
    });

    it("should match snapshot", () => {
      expect(render(<VerifyUser contactLastFourDigits="1234" />)).toMatchSnapshot();
    });

    it("should have a SEND VERIFICATION CODE button", async () => {
      const onConfirmation = jest.fn();
      const {getByText} = renderVerifyUserScreen({onConfirmation});

      const button = await getByText("SEND VERIFICATION CODE");

      expect(button).toBeInTheDocument();
    });

    it("should expect onConfirmation to be called after button click", async () => {
      const onConfirmation = jest.fn();
      const setLoading = jest.fn();
      const {getByText} = renderVerifyUserScreen({onConfirmation, setLoading});

      const button = await getByText("SEND VERIFICATION CODE");

      fireEvent.click(button);

      await waitFor(() => expect(setLoading).toBeCalledTimes(0));
      expect(onConfirmation).toBeCalledTimes(1);
    });
  });

  describe("when user is authorized(admin)", () => {
    beforeAll(() => {
      onlineOrderState.set({isAuthorized: true});
    });

    afterAll(() => {
      onlineOrderState.set({});
    });

    it("should match snapshot", () => {
      expect(render(<VerifyUser contactLastFourDigits="1234" />)).toMatchSnapshot();
    });

    it("should have a SHOW VERIFICATION CODE button", async () => {
      const onConfirmation = jest.fn();
      const {getByText} = renderVerifyUserScreen({onConfirmation});

      const button = await getByText("SHOW VERIFICATION CODE");

      expect(button).toBeInTheDocument();
    });

    it("should expect OTP to be set and onConfirmation to be called after button click", async () => {
      const onConfirmation = jest.fn();
      const setLoading = jest.fn();
      const setOTP = jest.fn();
      const {getByText} = renderVerifyUserScreen({
        phoneNumber: VerifiedCustomer.phoneNumber,
        storeId: Store.id,
        setLoading,
        setOTP,
        onConfirmation,
      });

      const button = await getByText("SHOW VERIFICATION CODE");

      fireEvent.click(button);

      await waitFor(() => expect(setLoading).toBeCalledTimes(2));
      await waitFor(() => expect(setLoading).toHaveBeenNthCalledWith(1, true));
      await waitFor(() => expect(setLoading).toHaveBeenNthCalledWith(2, false));
      await waitFor(() => expect(setOTP).toHaveBeenCalledWith(VerifiedCustomer.otp));
      await waitFor(() => expect(onConfirmation).toBeCalledTimes(1));
    });

    it("should do nothing if API fails", async () => {
      const onConfirmation = jest.fn();
      const setLoading = jest.fn();
      const setOTP = jest.fn();
      const {getByText} = renderVerifyUserScreen({
        phoneNumber: ErrorCustomer.phoneNumber,
        storeId: Store.id,
        setLoading,
        setOTP,
        onConfirmation,
      });

      const button = await getByText("SHOW VERIFICATION CODE");

      fireEvent.click(button);

      await waitFor(() => expect(setLoading).toBeCalledTimes(2));
      await waitFor(() => expect(setLoading).toHaveBeenNthCalledWith(1, true));
      await waitFor(() => expect(setLoading).toHaveBeenNthCalledWith(2, false));
      await waitFor(() => expect(setOTP).toBeCalledTimes(0));
    });
  });
});
