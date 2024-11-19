import React from "react";
import {Text, Flex, Image} from "rebass/styled-components";
import PropTypes from "prop-types";

import {HorizontalThreeDotIcon, IconBack} from "../../assets/images";
import styles from "../edit-subscription/index.styles";

import {INTERVAL_DISPLAY} from "../../constants/subscriptions";
import {formatAddress} from "../online-order/utils";
import useToggle from "../../hooks/useToggle";
import useWindowSize from "../../hooks/useWindowSize";

import {DockModal, SimplePopover, Dropdown} from "../common";
import CancelSubscription from "../common/CancelSubscription";

const ViewSusbcriptionPopup = props => {
  const {
    isOpen,
    toggle,
    loading,
    subscription,
    onSubscriptionFieldChange,
    isEditSubscription,
  } = props;

  const {isOpen: openThreeDotMenu, toggle: toggleThreeDotMenu} = useToggle();
  const {
    isOpen: openCancelSubscriptionPopup,
    toggle: toggleCancelSubscriptionPopup,
  } = useToggle();

  const [width, height] = useWindowSize();
  const fontSize = width < 300 ? "14px" : width <= 340 && width > 300 ? "16px" : "18px";

  const getWeekListFromObject = Object.entries(INTERVAL_DISPLAY).map(
    ([interval, display]) => {
      return {label: display, value: Number(interval)};
    }
  );

  const handleBackClick = () => {
    toggle();
  };

  const handleIntervalChange = ({value: interval}) => {
    onSubscriptionFieldChange({field: "interval", value: interval});
  };

  const handleNextPickupCancelReinstate = value => {
    onSubscriptionFieldChange({
      field: value ? "cancelNextPickup" : "reinstateNextPickup",
      value: true,
    });
  };

  const handleCancelSubscriptionClick = () => {
    toggleCancelSubscriptionPopup();
    onSubscriptionFieldChange({field: "isDeleted", value: true});
  };

  const handleNextPickupReinstate = () => {
    handleNextPickupCancelReinstate(!subscription?.isNextPickupCancelled);
  };

  return (
    <>
      <DockModal
        isOpen={isOpen}
        loading={loading}
        provideBackOption={false}
        fixedSize
        size={height}
      >
        <Flex {...styles.mainWrapper}>
          <Flex {...styles.header.wrapper}>
            <Image src={IconBack} onClick={handleBackClick} />
            <Text {...styles.header.text}>Recurring Pickup & Delivery</Text>
            <SimplePopover
              label={<Image src={HorizontalThreeDotIcon} />}
              isOpen={openThreeDotMenu}
              toggle={toggleThreeDotMenu}
              childrenStyles={styles.childrenStyles}
            >
              <Text {...styles.popoverItem} onClick={toggleCancelSubscriptionPopup}>
                Cancel Recurring
              </Text>
            </SimplePopover>
          </Flex>

          <Flex {...styles.bodyWrapper}>
            <Text {...styles.locationText} fontSize={fontSize}>
              {formatAddress(subscription?.centsCustomerAddress || {})}
            </Text>

            <Flex {...styles.weekDetails}>
              <Dropdown
                list={getWeekListFromObject}
                selectedListItem={subscription?.interval || 1}
                onListItemClick={handleIntervalChange}
              />
            </Flex>
            <Flex {...styles.detailWrapper}>
              <Text>Pickup:</Text>
              <Text {...styles.normalText}>{subscription.pickup}</Text>
              <Flex {...styles.deliveryDetails}>
                <Text>Delivery:</Text>
                <Text {...styles.normalText}>{subscription.delivery}</Text>
              </Flex>

              {subscription?.nextAvailablePickup && isEditSubscription ? (
                <>
                  <Flex>
                    <Text>
                      {`Your Next Pickup${
                        subscription?.isNextPickupCancelled ? " - " : ": "
                      }`}
                    </Text>
                    {subscription.isNextPickupCancelled ? (
                      <Text {...styles.redText}>SKIPPING:</Text>
                    ) : null}
                  </Flex>
                  <Text {...styles.normalText}>{subscription?.nextAvailablePickup}</Text>

                  {subscription?.isNextPickupCancelled ? (
                    <Text {...styles.blueText} onClick={handleNextPickupReinstate}>
                      Reinstate next pickup
                    </Text>
                  ) : subscription?.canCancelPickup ? (
                    <Text {...styles.blueText} onClick={handleNextPickupReinstate}>
                      Skip next pickup
                    </Text>
                  ) : null}
                </>
              ) : null}
            </Flex>

            <Text {...styles.footerDescription}>
              We will send you a reminder to get your laundry ready the night before we
              are scheduled to pick it up.
            </Text>
          </Flex>
        </Flex>
      </DockModal>
      <CancelSubscription
        header="Cancel Recurring Order"
        isOpen={openCancelSubscriptionPopup}
        toggle={toggleCancelSubscriptionPopup}
        cancelSubscription={handleCancelSubscriptionClick}
      />
    </>
  );
};

ViewSusbcriptionPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  subscription: PropTypes.any.isRequired,
  onSubscriptionFieldChange: PropTypes.func.isRequired,
  isEditSubscription: PropTypes.bool,
  loading: PropTypes.bool,
};

ViewSusbcriptionPopup.defaultProps = {
  subscription: {},
  onSubscriptionFieldChange: () => {},
  isEditSubscription: false,
  loading: false,
};

export default ViewSusbcriptionPopup;
