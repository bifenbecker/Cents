import React from "react";
import {Router as MemoryRouter} from "react-router-dom";
import {createMemoryHistory} from "history";
import {render, fireEvent, act, waitFor} from "@testing-library/react";
import ExistingSubscriptionPopUp from "../../../../components/common/existing-subscription-info-popup";

const history = createMemoryHistory();

const renderExistingSubscriptionPopUp = props => {
  const {getByText} = render(
    <MemoryRouter history={history}>
      <ExistingSubscriptionPopUp {...props} />
    </MemoryRouter>
  );

  return {getByText};
};

describe("Testing ExistingSubscription Component", () => {
  const onIgnoreExistingSubscriptions = jest.fn();
  const toggle = jest.fn();
  const existingSubscriptionsList = [];

  afterEach(() => {
    history.push("/");
  });

  it("Test existing subscription component UI snapshot", async () => {
    expect(
      render(
        <ExistingSubscriptionPopUp
          isOpen
          toggle={toggle}
          existingSubscriptionsList={existingSubscriptionsList}
          onIgnoreExistingSubscriptions={onIgnoreExistingSubscriptions}
        />
      )
    ).toMatchSnapshot();
  });

  it("Start new order button is clicked", async () => {
    const {getByText} = renderExistingSubscriptionPopUp({
      toggle,
      isOpen: true,
      existingSubscriptionsList,
      onIgnoreExistingSubscriptions,
    });
    const button = await getByText("START NEW ORDER");
    fireEvent.click(button);

    expect(onIgnoreExistingSubscriptions).toBeCalled();
  });

  it("Cancel button is clicked", async () => {
    const {getByText} = renderExistingSubscriptionPopUp({
      toggle,
      isOpen: true,
      existingSubscriptionsList,
      onIgnoreExistingSubscriptions,
    });
    const button = await getByText("CANCEL");
    fireEvent.click(button);

    expect(toggle).toBeCalled();
  });

  it("Should provide link to view subscription with appropriate text", async () => {
    const props = {
      toggle,
      isOpen: true,
      onIgnoreExistingSubscriptions,
      existingSubscriptionsList: [1],
    };

    const {getByText: getSingleSubscriptionText} = renderExistingSubscriptionPopUp(props);
    expect(
      await getSingleSubscriptionText("View existing recurring order")
    ).toBeInTheDocument();

    props.existingSubscriptionsList.push([2]);
    const {getByText: getMultipleSubscriptionsText} = renderExistingSubscriptionPopUp(
      props
    );
    expect(
      await getMultipleSubscriptionsText("View existing recurring orders")
    ).toBeInTheDocument();
  });

  it("Should close the modal and redirect to susbcription URL with search parameter when clicked on View Existing Recurring Order", async () => {
    const {getByText} = renderExistingSubscriptionPopUp({
      toggle,
      isOpen: true,
      onIgnoreExistingSubscriptions,
      existingSubscriptionsList: [{recurringSubscriptionId: 1}],
    });
    // Verifying if currently we are not in subscriptions
    expect(history.location.pathname).toEqual("/");

    const viewExistingSubscriptionButton = await getByText(
      "View existing recurring order"
    );
    fireEvent.click(viewExistingSubscriptionButton.parentNode);

    expect(history.location.pathname).toEqual(expect.stringContaining("/subscriptions"));
    expect(history.location.search).toEqual(expect.stringMatching(/subscriptionId=1/));
  });

  it("Should close the modal and redirect to susbcription URL with no search parameter when clicked on View Existing Recurring Orders", async () => {
    const {getByText} = renderExistingSubscriptionPopUp({
      toggle,
      isOpen: true,
      onIgnoreExistingSubscriptions,
      existingSubscriptionsList: [
        {recurringSubscriptionId: 1},
        {recurringSubscriptionId: 2},
      ],
    });
    // Verifying if currently we are not in subscriptions
    expect(history.location.pathname).toEqual("/");

    const viewExistingSubscriptionButton = await getByText(
      "View existing recurring orders"
    );
    fireEvent.click(viewExistingSubscriptionButton.parentNode);

    expect(history.location.pathname).toEqual(expect.stringContaining("/subscriptions"));
    expect(history.location.search).toEqual("");
  });

  it("should set fontSize according to window width", async () => {
    const {getByText} = renderExistingSubscriptionPopUp({
      toggle,
      isOpen: true,
      onIgnoreExistingSubscriptions,
      existingSubscriptionsList: [
        {recurringSubscriptionId: 1},
        {recurringSubscriptionId: 2},
      ],
    });
    const cancelBtnTxt = "CANCEL";
    const newOrderBtnTxt = "CANCEL";

    // width < 300
    act(() => {
      global.innerWidth = 250;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(cancelBtnTxt)).toHaveStyle({fontSize: "12px"}));
    await waitFor(() =>
      expect(getByText(newOrderBtnTxt)).toHaveStyle({fontSize: "12px"})
    );

    // 300 < width < 368
    act(() => {
      global.innerWidth = 340;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(cancelBtnTxt)).toHaveStyle({fontSize: "14px"}));
    await waitFor(() =>
      expect(getByText(newOrderBtnTxt)).toHaveStyle({fontSize: "14px"})
    );

    // width >= 368
    act(() => {
      global.innerWidth = 368;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(cancelBtnTxt)).toHaveStyle({fontSize: "16px"}));
    await waitFor(() =>
      expect(getByText(newOrderBtnTxt)).toHaveStyle({fontSize: "16px"})
    );
  });
});
