import React from "react";
import * as redux from "react-redux";
import {render, fireEvent} from "@testing-library/react";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";

import ReturnDeliveryConfirmationContent from "../../../../components/common/return-delivery-confirmation-popup/ReturnDeliveryConfirmationContent";

const day = "12";
const time = "30";
const onScheduleNowClick = jest.fn();

const initialState = {
  businessSettings: {
    data: {
      dryCleaningEnabled: false,
    },
  },
};
const mockStore = configureStore();
let store;

const mockDispatch = jest.fn();
const mockSelector = jest.fn();

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
  useSelector: () => mockSelector,
}));

const spy = jest.spyOn(redux, "useSelector");
spy.mockReturnValue({
  businessSettings: {
    data: {
      dryCleaningEnabled: false,
    },
  },
});

const renderReturnDeliveryConfirmationContent = () => {
  store = mockStore(initialState);
  const {container, queryByText} = render(
    <Provider store={store}>
      <ReturnDeliveryConfirmationContent
        {...{
          day,
          time,
          onScheduleNowClick,
        }}
      />
    </Provider>
  );

  return {container, queryByText};
};

describe("ReturnDeliveryConfirmationContent Component", () => {
  it("should match snapshot", () => {
    const {container} = renderReturnDeliveryConfirmationContent();
    expect(container).toMatchSnapshot();
  });

  it("should call onScheduleNowClick when `click here` is clicked", () => {
    const {queryByText} = renderReturnDeliveryConfirmationContent();

    const button = queryByText("Click here");
    fireEvent.click(button);

    expect(onScheduleNowClick).toBeCalled();
  });
});
