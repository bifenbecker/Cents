import React, {useMemo} from "react";
import PropTypes from "prop-types";
import {Text, Flex, Button, Box} from "rebass/styled-components";
import {useHistory} from "react-router";

// Import Swiper React components
import {Swiper, SwiperSlide} from "swiper/react";
import SwiperCore, {Pagination} from "swiper/core";
import "swiper/swiper-bundle.min.css";
import "./swiper.scss";

import styles from "./index.styles";

import {formatAddress} from "../../online-order/utils";
import useWindowSize from "../../../hooks/useWindowSize";

import {DockModal} from "..";

const ExistingSubscriptionPopUp = ({
  isOpen,
  existingSubscriptionsList,
  toggle,
  onIgnoreExistingSubscriptions,
}) => {
  const history = useHistory();
  const [width, height] = useWindowSize();
  const subscriptionArrayLength = existingSubscriptionsList?.length || 0;

  const getSize = useMemo(() => {
    if (height >= 568) {
      return subscriptionArrayLength > 1 ? 372 : 392;
    } else {
      return 0.75 * height;
    }
  }, [height, subscriptionArrayLength]);

  SwiperCore.use([Pagination]);

  const closeModal = () => {
    toggle();
  };

  const onStartNewOrder = () => {
    onIgnoreExistingSubscriptions();
    toggle();
  };

  const onClickViewExistingSubscription = () => {
    history.push(
      `/subscriptions${
        subscriptionArrayLength === 1
          ? `?subscriptionId=${existingSubscriptionsList?.[0]?.recurringSubscriptionId}`
          : ""
      }`
    );
    toggle();
  };

  const fontSize = width < 320 ? "12px" : width < 368 ? "14px" : "16px";
  const subscriptionsMessage =
    subscriptionArrayLength > 1
      ? "You have existing recurring orders"
      : "You have an existing recurring order";

  return (
    <DockModal
      isOpen={isOpen}
      provideBackOption={false}
      fixedSize
      size={getSize}
      toggle={toggle}
      closeOnOutsideClick={true}
    >
      <Flex {...styles.mainWrapper}>
        <Flex {...styles.textContent}>
          <Text {...styles.boldText}>{subscriptionsMessage}</Text>
        </Flex>
        <Flex {...styles.subscriptionInfoContainer}>
          {subscriptionArrayLength > 1 ? (
            <Swiper
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              spaceBetween={50}
              centeredSlides
              slidesPerView={1}
              loop
              grabCursor
              style={styles.swiperStyle}
            >
              {existingSubscriptionsList.map((item, i) => (
                <SwiperSlide key={i}>
                  <Box {...styles.swiperItemWrapper}>
                    <SusbcriptionItem subscription={item} fromCarousel width={width} />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <SusbcriptionItem subscription={existingSubscriptionsList[0]} width={width} />
          )}
        </Flex>

        <Flex
          {...styles.viewExistingContainer}
          mt={subscriptionArrayLength > 1 ? 0 : "25px"}
          onClick={onClickViewExistingSubscription}
        >
          <Text {...styles.existingSubscriptionText}>
            View existing recurring order{subscriptionArrayLength > 1 ? "s" : ""}
          </Text>
        </Flex>
        <Flex {...styles.footer.wrapper}>
          <Button
            variant="outline"
            {...styles.footer.cancelButton}
            fontSize={fontSize}
            onClick={closeModal}
          >
            CANCEL
          </Button>
          <Button
            variant="primary"
            {...styles.footer.newOrderButton}
            fontSize={fontSize}
            onClick={onStartNewOrder}
          >
            START NEW ORDER
          </Button>
        </Flex>
      </Flex>
    </DockModal>
  );
};

const SusbcriptionItem = ({subscription, fromCarousel = false, width}) => {
  const nextPickupFontSize =
    width < 320 ? "16px" : fromCarousel || width < 368 ? "18px" : "24px";

  const [weekday, date, window] = subscription?.nextAvailablePickup?.split(", ") || [];

  return (
    <>
      <Flex {...styles.subscriptionAddressWrapper}>
        <Text {...styles[fromCarousel ? "normalTextCarousel" : "normalText"]}>
          {formatAddress(subscription?.centsCustomerAddress)}
        </Text>
      </Flex>
      <Flex
        {...styles[fromCarousel ? "nextPickupContainerCarousel" : "nextPickupContainer"]}
      >
        <Text
          {...styles[fromCarousel ? "nextPickupTextCarousel" : "nextPickupText"]}
          fontSize={nextPickupFontSize}
        >
          Next pickup scheduled for
        </Text>
        <Text
          {...styles[fromCarousel ? "nextPickupTextCarousel" : "nextPickupText"]}
          fontSize={nextPickupFontSize}
        >
          {window}
        </Text>
      </Flex>
      <Flex {...styles.subscriptionAddressWrapper}>
        <Text {...styles[fromCarousel ? "dateTextCarousel" : "dateText"]}>
          {weekday}, {date}
        </Text>
      </Flex>
    </>
  );
};

ExistingSubscriptionPopUp.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  existingSubscriptionsList: PropTypes.array.isRequired,
  onIgnoreExistingSubscriptions: PropTypes.func.isRequired,
};

export default ExistingSubscriptionPopUp;
