import React, {useEffect, useCallback} from "react";
import PropTypes from "prop-types";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import exitIcon from "../../../../../assets/images/Icon_Exit_Side_Panel.svg";

const CheckedInEmployees = ({
  location,
  isLocationDetailsLoading,
  onSetShowCheckedInEmployees,
  fetchCheckedInEmployeesApiError,
  fetchCheckedInEmployeesLoading,
  onFetchCheckedInEmployees,
  checkedInEmployees,
}) => {
  const {id, address} = location;

  const loadEmployees = useCallback(async () => {
    try {
      await onFetchCheckedInEmployees(id);
    } catch (err) {
      console.log("err: ", err);
    }
  }, [onFetchCheckedInEmployees, id]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees, id]);

  return (
    <>
      <div className="locations-card-content reset-password-content">
        <div className="reset-password-container">
          <div className="exit-icon-container">
            <img
              src={exitIcon}
              alt="exit"
              onClick={async () => {
                // This WOULD REFRESH the active selected location details
                onSetShowCheckedInEmployees(false);
              }}
            />
          </div>
          <div className="reset-password-header">
            <p className="address-subtitle">{address.toUpperCase()}</p>
            <p className="main-header">Checked In Employees </p>
          </div>
          <div className="reset-password-body">
            {checkedInEmployees && checkedInEmployees.length > 0 ? (
              checkedInEmployees.map((employee, idx) => {
                return (
                  <p key={`${employee.fullName}_${idx}`}>
                    <b>{employee}</b>
                  </p>
                );
              })
            ) : (
              <p className="main-header">
                {" "}
                No team members are currently checked in at this location.{" "}
              </p>
            )}
          </div>
          <div className="locations-card-footer">
            <p className="reset-passsword-error-message">
              {fetchCheckedInEmployeesApiError || ""}
            </p>
          </div>
        </div>
      </div>
      {(isLocationDetailsLoading || fetchCheckedInEmployeesLoading) && <BlockingLoader />}
    </>
  );
};

CheckedInEmployees.propTypes = {
  location: PropTypes.object,
  isLocationDetailsLoading: PropTypes.bool,
  onSetShowCheckedInEmployees: PropTypes.func,
  fetchCheckedInEmployeesApiError: PropTypes.string,
  fetchCheckedInEmployeesLoading: PropTypes.bool,
  onFetchCheckedInEmployees: PropTypes.func,
  checkedInEmployees: PropTypes.array,
};

export default CheckedInEmployees;
