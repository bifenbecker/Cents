import React from "react";
import {render} from "@testing-library/react";

import PickupDeliveryOrderSummary from "../../../../components/common/pickupDeliveryOrderSummary";
import {DELIVERY_PROVIDERS} from "../../../../constants/order";

const renderPickupDeliveryOrderSummary = props => {
  const {getByText, container} = render(<PickupDeliveryOrderSummary {...props} />);
  return {getByText, container};
};

describe("Testing pickup and delivery order summary Component", () => {
  describe("Should render relevant child components based on combinations of pickup and delivery providers", () => {
    it("Case - Pickup - No, Delivery - Own Driver", () => {
      const {getByText, container} = renderPickupDeliveryOrderSummary({
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
      });
      expect(getByText("Delivery")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("Case - Pickup - No, Delivery - Not Own Driver", () => {
      const {getByText, container} = renderPickupDeliveryOrderSummary({
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
      });
      expect(getByText("On-Demand Delivery")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("Case - Pickup - Own Driver, Delivery - Own Driver", () => {
      const {getByText, container} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
      });
      expect(getByText("Pickup & Delivery")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("Case - Pickup - Own Driver, Delivery - No", () => {
      const {getByText, container} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
      });
      expect(getByText("Pickup")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("Case - Pickup - Not Own Driver, Delivery - No", () => {
      const {getByText, container} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
      });
      expect(getByText("On-Demand Pickup")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("Case - Pickup - Not Own Driver, Delivery - Own Driver", () => {
      const {getByText, container} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
      });
      expect(getByText("On-Demand Pickup")).toBeInTheDocument();
      expect(getByText("Delivery")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("Case - Pickup - Own Driver, Delivery - Not Own Driver", () => {
      const {getByText, container} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.uber},
      });
      expect(getByText("Pickup")).toBeInTheDocument();
      expect(getByText("On-Demand Delivery")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("Case - Pickup - Not Own Driver, Delivery - Not Own Driver", () => {
      const {getByText, container} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.uber},
      });
      expect(getByText("On-Demand Pickup & Delivery")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe("On demand summary - should calculate tip and show in different cases", () => {
    it("Case - tip provided for both pickup and delivery", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        pickupDeliveryTip: 1,
        returnDeliveryTip: 1,
      });
      expect(getByText("Split evenly between both drivers")).toBeInTheDocument();
      expect(getByText("Pickup & Delivery Driver Tips")).toBeInTheDocument();
      expect(getByText("$2.00")).toBeInTheDocument();
    });

    it("Case - tip provided for pickup only", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        pickupDeliveryTip: 4,
      });
      expect(getByText("Pickup Driver Tip")).toBeInTheDocument();
      expect(getByText("$4.00")).toBeInTheDocument();
    });

    it("Case - tip provided for delivery only", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        returnDeliveryTip: 6,
      });
      expect(getByText("Delivery Driver Tip")).toBeInTheDocument();
      expect(getByText("$6.00")).toBeInTheDocument();
    });

    it("Case - own driver pickup, on demand delivery tip provided", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        returnDeliveryTip: 6,
      });
      expect(getByText("Delivery Driver Tip")).toBeInTheDocument();
      expect(getByText("$6.00")).toBeInTheDocument();
    });

    it("Case - own driver delivery, on demand pickup tip provided", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
        returnDeliveryTip: 6,
      });
      expect(getByText("Delivery Driver Tip")).toBeInTheDocument();
      expect(getByText("$6.00")).toBeInTheDocument();
    });
  });

  describe("Standard Summary - should show pickup and delivery fees in different cases", () => {
    it("Pickup and delivery - should show pickup and delivery fees", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
        pickupDeliveryFee: 6,
        returnDeliveryFee: 2,
      });
      expect(getByText("($4.00 each way)")).toBeInTheDocument();
    });

    it("Pickup only - should show FREE if no pickup fee", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
        pickupDeliveryFee: 7,
      });
      expect(getByText("$7.00")).toBeInTheDocument();
    });

    it("Pickup only - should show pickup fee", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
      });
      expect(getByText("FREE")).toBeInTheDocument();
    });

    it("Delivery only - should show FREE if no delivery fee", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
        returnDeliveryFee: 5,
      });
      expect(getByText("$5.00")).toBeInTheDocument();
    });

    it("Delivery only - should show delivery fee", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.ownDriver},
      });
      expect(getByText("FREE")).toBeInTheDocument();
    });
  });

  describe("On demand Summary - should show pickup and delivery fees in different cases", () => {
    it("Should calculate and display trip cost", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        delivery: {
          deliveryProvider: DELIVERY_PROVIDERS.doorDash,
          totalDeliveryCost: 4,
          subsidyInCents: 400,
          thirdPartyDeliveryCostInCents: 400,
        },
      });
      expect(getByText("Trip cost: $8.00")).toBeInTheDocument();
    });

    it("Should show laundry subsidy correctly", () => {
      let getByText = renderPickupDeliveryOrderSummary({
        delivery: {
          deliveryProvider: DELIVERY_PROVIDERS.doorDash,
          totalDeliveryCost: 4,
          subsidyInCents: 400,
          thirdPartyDeliveryCostInCents: 200,
        },
      }).getByText;
      expect(getByText("Subsidy: -$2.00")).toBeInTheDocument();

      getByText = renderPickupDeliveryOrderSummary({
        delivery: {
          deliveryProvider: DELIVERY_PROVIDERS.doorDash,
          totalDeliveryCost: 4,
          subsidyInCents: 300,
          thirdPartyDeliveryCostInCents: 600,
        },
      }).getByText;
      expect(getByText("Subsidy: -$3.00")).toBeInTheDocument();
    });

    it("Should show driver fee if store location is in California", () => {
      const {getByText} = renderPickupDeliveryOrderSummary({
        delivery: {
          deliveryProvider: DELIVERY_PROVIDERS.doorDash,
        },
        storeLocation: "CA",
      });
      expect(getByText("Includes CA Driver Fee: $2.00")).toBeInTheDocument();
    });

    it("Should show on demand pickup and delivery fees correctly", () => {
      const orderDetails = {
        pickup: {
          deliveryProvider: DELIVERY_PROVIDERS.doorDash,
        },
        delivery: {
          deliveryProvider: DELIVERY_PROVIDERS.doorDash,
        },
      };
      let getByText = renderPickupDeliveryOrderSummary({
        ...orderDetails,
        pickupDeliveryFee: 2,
        returnDeliveryFee: 3,
        storeLocation: "California",
      }).getByText;
      expect(getByText("(~ $2.50 each way)")).toBeInTheDocument();
      expect(
        getByText("Includes CA Driver Fee: $4.00 ($2.00 each way)")
      ).toBeInTheDocument();

      getByText = renderPickupDeliveryOrderSummary({
        ...orderDetails,
        pickupDeliveryFee: 2,
      }).getByText;
      expect(getByText("(pickup: $2.00, delivery: $0.00)")).toBeInTheDocument();

      getByText = renderPickupDeliveryOrderSummary({
        ...orderDetails,
        returnDeliveryFee: 3,
      }).getByText;
      expect(getByText("(pickup: $0.00, delivery: $3.00)")).toBeInTheDocument();
    });

    it("Should show on demand pickup and delivery subsidy correctly", () => {
      const orderDetails = {
        pickup: {
          subsidyInCents: 200,
          thirdPartyDeliveryCostInCents: 100,
          deliveryProvider: DELIVERY_PROVIDERS.doorDash,
        },
        delivery: {
          subsidyInCents: 300,
          thirdPartyDeliveryCostInCents: 200,
          deliveryProvider: DELIVERY_PROVIDERS.doorDash,
        },
      };
      let getByText = renderPickupDeliveryOrderSummary({
        ...orderDetails,
      }).getByText;
      expect(getByText("Subsidy: -$3.00")).toBeInTheDocument();
      expect(getByText("(-$1.50 each way)")).toBeInTheDocument();

      getByText = renderPickupDeliveryOrderSummary({
        pickup: orderDetails.pickup,
        delivery: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
      }).getByText;
      expect(getByText("Subsidy: -$1.00")).toBeInTheDocument();
      expect(getByText("(pickup: -$1.00, delivery: $0.00)")).toBeInTheDocument();

      getByText = renderPickupDeliveryOrderSummary({
        delivery: orderDetails.delivery,
        pickup: {deliveryProvider: DELIVERY_PROVIDERS.doorDash},
      }).getByText;
      expect(getByText("Subsidy: -$2.00")).toBeInTheDocument();
      expect(getByText("(pickup: $0.00, delivery: -$2.00)")).toBeInTheDocument();
    });
  });
});
