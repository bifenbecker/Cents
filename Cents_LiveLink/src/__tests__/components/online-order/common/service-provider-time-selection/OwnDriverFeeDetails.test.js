import React from "react";
import {render, waitFor} from "@testing-library/react";
import OwnDriverFeeDetails from "../../../../../components/common/order-sections/delivery-windows/service-provider-time-selection/OwnDriverFeeDetails";

const renderOwnDriverFeeDetailsComponent = props => {
  const {getByText} = render(<OwnDriverFeeDetails {...props} />);

  return {getByText};
};

describe("OwnDriverFeeDetails Component", () => {
  const deliveryFee = {
    ownDriver: {deliveryFeeInCents: 500},
  };

  it("Test OwnDriverFeeDetails UI snapshot when isPickup is true", async () => {
    expect(
      render(<OwnDriverFeeDetails isPickup={true} deliveryFee={deliveryFee} />)
    ).toMatchSnapshot();
  });

  it("Test OwnDriverFeeDetails UI snapshot when isPickup is false", async () => {
    expect(
      render(<OwnDriverFeeDetails isPickup={false} deliveryFee={deliveryFee} />)
    ).toMatchSnapshot();
  });

  describe("Test OwnDriverFeeDetails Text ==> laundry to be", () => {
    it("should display text When would you like your laundry to be picked up", async () => {
      const {getByText} = renderOwnDriverFeeDetailsComponent({
        isPickup: true,
        deliveryFee: {deliveryFee},
      });

      const pickedUpLabel = await getByText(
        "When would you like your laundry to be picked up?"
      );

      await waitFor(() => expect(pickedUpLabel).toBeInTheDocument());
    });

    it("should display text When would you like your laundry to be delivered", async () => {
      const {getByText} = renderOwnDriverFeeDetailsComponent({
        isPickup: false,
        deliveryFee: {deliveryFee},
      });

      const pickedUpLabel = await getByText(
        "When would you like your laundry to be delivered?"
      );

      await waitFor(() => expect(pickedUpLabel).toBeInTheDocument());
    });
  });
});
