import React from "react";
import {render, fireEvent} from "@testing-library/react";

import StoreInfo from "../../../components/order-summary/StoreInfo";

const onClose = jest.fn();
const renderStoreInfo = props => {
  const {container, getByText, getByAltText} = render(
    <StoreInfo {...props} onClose={onClose} />
  );

  return {container, getByText, getByAltText};
};

describe("StoreInfo component", () => {
  it("Should match snapshot", () => {
    const {container} = renderStoreInfo({
      orderDetails: {
        store: {
          name: "Store one",
          address: "Address of the store one",
          city: "Pune",
          state: "Maharashtra",
          zipCode: "413523",
          phoneNumber: "54765486458",
          dcaLicense: true,
          commercialDcaLicense: true,
        },
      },
    });

    expect(container).toMatchSnapshot();
  });

  it("Should close modal when clicked on cross icon", () => {
    const {getByAltText} = renderStoreInfo({
      orderDetails: {
        store: {
          name: "Store one",
          address: "Address of the store one",
          city: "Pune",
          state: "Maharashtra",
          zipCode: "413523",
          phoneNumber: "54765486458",
          dcaLicense: true,
          commercialDcaLicense: true,
        },
      },
    });
    const closeModal = getByAltText("Modal Close");
    fireEvent.click(closeModal);

    expect(onClose).toHaveBeenCalled();
  });
});
