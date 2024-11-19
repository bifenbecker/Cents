import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {BottomSheet} from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import "./DetailsDrawer.scss";
import {Box, Flex} from "rebass/styled-components";

// Components
import Summary from "../Summary";
import SheetFooter from "./SheetFooter";
import styles from "./index.styles";

const CLOSED_SHEET_HEIGHT = 150;
// Height - CentsHeader - TimelineHeader
const getOpenSheetHeight = maxHeight => maxHeight - 67 - 48;

const DetailsDrawer = props => {
  const {
    orderDetails,
    storeSettings,
    toggleApplyPromo,
    toggleApplyCredit,
    toggleUpdatePayment,
    toggleStoreInfo,
    toggleCancelOrderConfirmation,
    toggleCADriverFeePopup,
    removePromo,
    removeCredits,
    paymentMethod,
    updateTip,
    onAddPaymentMethod,
    onPayForOrder,
  } = props;

  const sheetRef = useRef();
  const [sheetHeight, setSheetHeight] = useState(CLOSED_SHEET_HEIGHT);

  const drawerOpen = useMemo(() => sheetHeight > CLOSED_SHEET_HEIGHT, [sheetHeight]);
  const toggleDrawerOpen = useCallback(() => {
    sheetRef.current.snapTo(({height, snapPoints}) =>
      height === CLOSED_SHEET_HEIGHT ? Math.max(...snapPoints) : Math.min(...snapPoints)
    );
  }, []);

  const handleScroll = () => {
    const scrollableDiv = document.querySelector("[data-rsbs-scroll]");
    scrollableDiv.style.overflow =
      sheetRef.current.height <= CLOSED_SHEET_HEIGHT ? "hidden" : "auto";
    setSheetHeight(sheetRef.current.height);
  };

  useEffect(() => {
    if (sheetHeight <= 150) {
      scrollContentToTop();
    }
  }, [sheetHeight]);

  const handleSpringStart = () => {
    // Transition from
    handleScroll();
    // scrollContentToTop();
    requestAnimationFrame(() => {
      // Transition to
      handleScroll();
    });
  };

  const handleSpringEnd = () => {
    // Transition ended at
    handleScroll();
    // scrollContentToTop();
  };

  const handleDismiss = () => {
    sheetRef.current.snapTo(CLOSED_SHEET_HEIGHT);
  };

  const contentRef = useRef();

  const scrollContentToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({behavior: "smooth"});
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      blocking={false}
      defaultSnap={CLOSED_SHEET_HEIGHT}
      snapPoints={({maxHeight}) => [CLOSED_SHEET_HEIGHT, getOpenSheetHeight(maxHeight)]}
      open
      scrollLocking
      expandOnContentDrag
      skipInitialTransition
      onSpringStart={handleSpringStart}
      onSpringEnd={handleSpringEnd}
      className="details-drawer"
      footer={
        <SheetFooter
          updateTip={updateTip}
          drawerOpen={drawerOpen}
          orderDetails={orderDetails}
          paymentMethod={paymentMethod}
          storeSettings={storeSettings}
          onPayForOrder={onPayForOrder}
          toggleStoreInfo={toggleStoreInfo}
          toggleDrawerOpen={toggleDrawerOpen}
          onAddPaymentMethod={onAddPaymentMethod}
          toggleUpdatePayment={toggleUpdatePayment}
        />
      }
      sibling={
        drawerOpen ? (
          <Box
            className="summary-details-backdrop"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleDismiss();
            }}
          />
        ) : null
      }
    >
      <Flex {...styles.content} ref={contentRef}>
        <Box {...styles.contentWrapper}>
          <Summary
            toggleDrawerOpen={toggleDrawerOpen}
            drawerOpen={drawerOpen}
            orderDetails={orderDetails}
            toggleApplyPromo={toggleApplyPromo}
            toggleApplyCredit={toggleApplyCredit}
            toggleStoreInfo={toggleStoreInfo}
            removePromo={removePromo}
            removeCredits={removeCredits}
            toggleCancelOrderConfirmation={toggleCancelOrderConfirmation}
            toggleCADriverFeePopup={toggleCADriverFeePopup}
          />
        </Box>
      </Flex>
    </BottomSheet>
  );
};

export default DetailsDrawer;
