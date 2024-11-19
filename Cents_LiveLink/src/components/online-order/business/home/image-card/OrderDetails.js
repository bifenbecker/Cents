import {Typography} from "@material-ui/core";

export const RecentOrderInfo = ({services, modifiers}) => {
  //TODO: fix the Array handling
  let slicedServices, slicedModifiers;

  if (typeof services === "string") {
    slicedServices = [services];
    slicedModifiers = [modifiers];
  } else {
    slicedServices = services?.slice(0, 3);
    slicedModifiers = slicedModifiers?.slice(0, 2);
  }

  return (
    <>
      <Typography style={styles.typographyHeader}>Recent Order</Typography>
      {slicedServices?.map((service) => (
        <Typography style={{...styles.typographyText, marginTop: "8px"}} key={service}>
          {service}
        </Typography>
      )) || ""}
      {slicedModifiers?.map((modifier) => (
        <Typography
          style={{
            ...styles.typographyText,
            marginTop: "16px",
            overflowWrap: "break-word",
          }}
          key={modifier}
        >
          {modifier}
        </Typography>
      )) || ""}
    </>
  );
};

export const ProcessingOrderInfo = ({time, scheduling, orderStatus}) => {
  const {window, weekDay, date} = time;

  return (
    <>
      <Typography style={styles.typographyHeader}>Your Order</Typography>
      <Typography color="primary" style={styles.typographySubStatus}>
        {orderStatus}
      </Typography>
      <Typography style={{...styles.typographyStatus}}>{scheduling}</Typography>
      <Typography style={styles.typographyText}>{window || ""}</Typography>
      <Typography style={styles.typographyText}>{`${weekDay || ""}, ${
        date || ""
      }`}</Typography>
    </>
  );
};

export const ScheduledOrderInfo = ({time}) => {
  const {window, weekDay, date} = time;
  return (
    <>
      <Typography style={styles.typographyHeader}>Next Order</Typography>
      <Typography style={{...styles.typographyStatus}}>Pickup Scheduled</Typography>
      <Typography style={styles.typographyText}>{window || ""}</Typography>
      <Typography style={styles.typographyText}>{`${weekDay || ""}, ${
        date || ""
      }`}</Typography>
    </>
  );
};

const styles = {
  typographyHeader: {
    fontFamily: "Inter",
    fontStyle: "normal",
    fontSize: "24px",
    fontWeight: "700",
    lineHeight: "28px",
    color: "#303651",
  },
  typographyText: {
    fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "17px",
    color: "#303651",
    maxHeight: "50px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  typographyStatus: {
    fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "17px",
    color: "#303651",
    marginTop: "16px",
  },
  typographySubStatus: {
    fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "17px",
    marginTop: "8px",
  },
};
