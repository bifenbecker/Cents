import React from "react";
import PropTypes from "prop-types";
import {formatToThousandRoundedNumber} from "utils/functions";

const DashboardInsight = ({value, description, prefix, postfix, disableRoundingOff}) => {
  let formattedValue = `${prefix || ""}${
    disableRoundingOff ? value : formatToThousandRoundedNumber(value)
  }${postfix || ""}`;
  return (
    <div className="dashboard-insight">
      <p className="number">{formattedValue}</p>
      <p className="description">{description}</p>
    </div>
  );
};

DashboardInsight.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  postfix: PropTypes.string,
  disableRoundingOff: PropTypes.bool,
};

export default DashboardInsight;
