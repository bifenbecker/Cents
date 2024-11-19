import React from "react";
import {render, fireEvent} from "@testing-library/react";
import PickupCard from "../../../../components/online-order/business/PickupCard";

const renderPickupCardComponent = props => {
  const {getByText} = render(<PickupCard {...props} />);

  return {getByText};
};

describe("Testing PickupCard Component", () => {
  const onScheduleClick = jest.fn();
  it("Test pickupcard UI snapshot", async () => {
    expect(render(<PickupCard onScheduleClick={jest.fn()} />)).toMatchSnapshot();
  });

  it("Schedule Pickup btn is clicked", async () => {
    const {getByText} = renderPickupCardComponent({
      onScheduleClick: onScheduleClick,
    });
    const button = await getByText("Schedule Pickup");
    fireEvent.click(button);

    expect(onScheduleClick).toBeCalled();
  });
});
