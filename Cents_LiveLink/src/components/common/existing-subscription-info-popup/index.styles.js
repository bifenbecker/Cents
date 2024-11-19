const styles = {
  mainWrapper: {
    sx: {
      height: "100%",
      flexDirection: "column",
    },
    padding: "20px",
  },
  swiperStyle: {
    padding: "5px",
    width: "100%",
    height: "170px",
  },
  swiperItemWrapper: {
    sx: {
      borderRadius: "24px",
      boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
    },
  },
  subscriptionInfoContainer: {
    pb: "10px",
    flexDirection: "column",
  },
  nextPickupContainer: {
    flexDirection: "column",
    width: "100%",
    mt: "20px",
  },
  nextPickupContainerCarousel: {
    flexDirection: "column",
    width: "100%",
    mt: "5px",
  },
  subscriptionAddressWrapper: {
    flexDirection: "column",
    width: "100%",
  },
  nextPickupText: {
    fontWeight: 900,
    color: "BLACK",
    fontSize: "24px",
  },
  nextPickupTextCarousel: {
    pl: "15px",
    pr: "15px",
    fontWeight: 900,
    color: "BLACK",
    fontSize: "20px",
  },
  textContent: {
    flexDirection: "column",
    sx: {
      mb: "10px",
    },
  },
  viewExistingContainer: {
    flexDirection: "column",
    mb: "32px",
  },
  existingSubscriptionText: {
    color: "primary",
    fontWeight: 500,
    lineHeight: "18px",
    sx: {
      textDecoration: "underline",
    },
  },
  boldText: {
    color: "primary",
    fontWeight: 700,
    lineHeight: "18px",
  },
  normalTextCarousel: {
    fontSize: "14px",
    color: "primary",
    fontFamily: "secondary",
    p: "15px",
  },
  normalText: {
    fontSize: "18px",
    color: "black",
    pt: "25px",
    fontFamily: "secondary",
  },
  dateText: {
    fontSize: "18px",
    color: "black",
    fontFamily: "secondary",
    mt: "15px",
  },
  dateTextCarousel: {
    fontSize: "14px",
    color: "black",
    fontFamily: "secondary",
    p: "15px",
  },
  footer: {
    wrapper: {
      width: "100%",
    },
    cancelButton: {
      width: "48%",
      height: "62px",
      fontSize: "16px",
      margin: "0px 8px",
      fontFamily: "primary",
      sx: {
        textTransform: "uppercase",
        boxShadow:
          "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
      },
    },
    newOrderButton: {
      width: "100%",
      height: "62px",
      fontSize: "16px",
      margin: "0px 5px",
      sx: {
        textTransform: "uppercase",
        boxShadow:
          "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
      },
    },
  },
};
export default styles;
