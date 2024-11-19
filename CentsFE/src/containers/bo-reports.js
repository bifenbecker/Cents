import {connect} from "react-redux";
import Reports from "../components/business-owner/reports/reports";

const mapStateToProps = (state) => {
  return {
    filteredLocations: state.businessOwner.dashboard.selectedLocations,
    allLocations: state.businessOwner.dashboard.allLocations,
    ...state.businessOwner.orders,
  };
};

export default connect(mapStateToProps)(Reports);
