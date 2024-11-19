import React from "react";
import {render, fireEvent, waitFor} from "@testing-library/react";

import {CADriverFeeInfoPopup} from "../../../../components/common";
import {act} from "react-dom/test-utils";

const renderCADriverInfoPopup = props => {
  const {getByText} = render(<CADriverFeeInfoPopup {...props} />);

  return {getByText};
};

describe("CADriverFeeInfoPopup Component", () => {
  const close = jest.fn();

  it("should match snapshot", () => {
    expect(render(<CADriverFeeInfoPopup isOpen close={close} />)).toMatchSnapshot();
  });

  it("should call close prop on clicking close button", async () => {
    const {getByText} = renderCADriverInfoPopup({
      isOpen: true,
      close,
    });

    const button = await getByText("Close");

    fireEvent.click(button);

    expect(close).toBeCalledTimes(1);
  });

  it("should set fontSize according to window width", async () => {
    const {getByText} = renderCADriverInfoPopup({
      isOpen: true,
      close,
    });
    const headerTxt = "What is the CA Driver Fee?";

    // width < 300
    act(() => {
      global.innerWidth = 250;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(headerTxt)).toHaveStyle({fontSize: "14px"}));

    // 300 < width <= 340
    act(() => {
      global.innerWidth = 340;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(headerTxt)).toHaveStyle({fontSize: "16px"}));

    // width > 340
    act(() => {
      global.innerWidth = 341;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(headerTxt)).toHaveStyle({fontSize: "18px"}));
  });
});
